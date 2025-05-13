// src/routes/chat.ts
import { Router } from 'express';
import { querySimilar } from '../services/vectorDb';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// Function schema for searching the knowledge base
const functions = [
  {
    name: 'search_knowledge_base',
    description: 'Search the article knowledge base for relevant documents',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { type: 'integer', default: 5 }
      },
      required: ['query']
    }
  }
];

const SYSTEM_PROMPT = `
# Identity
- You are a helpful technical-support copilot. Your job is to help users integrate against our documentation and APIs.

# Knowledge Base
- Whenever the user asks a question you can’t yet answer from memory, call the \`search_knowledge_base\` function.
- Only base your answers on what comes back from \`search_knowledge_base\`.
- Keep your answers short and concise, but include the code snippets needed.

# Response Format
- **Always** respond in valid **Markdown**.
- Separate paragraphs with a blank line.
- Use **fenced code blocks** with the correct language tag (e.g. \`\`\`jsx … \`\`\`) for any code.
- Do **not** emit any raw HTML (\`<p>\`, \`<code>\`, etc.).
- Use bullet lists or numbered lists when enumerating steps.
- Ask follow-up questions if the user’s request is ambiguous (e.g. “Which programming language are you using?”).

# Flow
1. User asks a question.
2. If you need more context, call \`search_knowledge_base\`.
3. Incorporate the function results and give the final answer in Markdown.
4. Always check if you need to clarify (e.g. target language, framework, etc.).
`;

// In-memory session history
const sessionHistory: Record<string, Array<ChatCompletionMessageParam>> = {};
function getHistory(sessionId: string) {
  if (!sessionHistory[sessionId]) {
    sessionHistory[sessionId] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
  }
  return sessionHistory[sessionId];
}

// Helper to write SSE chunks with preserved newlines
function writeChunk(res: any, text: string) {
  const lines = text.split(/\n/);
  for (const line of lines) {
    res.write(`data: ${line}\n`);
  }
  res.write('\n');
}

// GET /chat (SSE stream)
router.get('/', async (req, res) => {
  const { sessionId, message } = req.query as { sessionId: string; message: string };

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const history = getHistory(sessionId);
    history.push({ role: 'user', content: message });

    // 1️⃣ Stream initial completion to detect tool calls
    const firstStream = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: history,
      functions,
      function_call: 'auto',
      stream: true
    });

    let initialText = '';
    let funcName = '';
    let funcArgs = '';

    for await (const chunk of firstStream) {
      const delta = chunk.choices[0].delta;

      // Newer field: tool_calls
      if (delta?.tool_calls) {
        for (const call of delta.tool_calls) {
          const fn = call.function;
          if (fn?.name) funcName = fn.name;
          if (fn?.arguments) funcArgs += fn.arguments;
        }
      }
      // Fallback: deprecated function_call
      else if (delta?.function_call) {
        if (delta.function_call.name) funcName = delta.function_call.name;
        if (delta.function_call.arguments) funcArgs += delta.function_call.arguments;
      }

      // Regular content
      if (delta?.content) {
        initialText += delta.content;
        writeChunk(res, delta.content);
      }
    }

    // Signal end of the initial “thought”
    res.write('event: initial_end\ndata: [DONE]\n\n');

    // 2️⃣ If a function was called, perform lookup
    if (funcName === 'search_knowledge_base') {
      const args = JSON.parse(funcArgs || '{}');
      const { query, limit = 5 } = args;

      // Compute embedding
      const embedRes = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: [query]
      });
      const queryEmbedding = embedRes.data[0].embedding;
      const docs = await querySimilar(queryEmbedding, limit);

      // Update history with function-call and result
      history.push({
        role: 'assistant',
        content: initialText,
        function_call: { name: funcName, arguments: funcArgs }
      } as any as ChatCompletionMessageParam);
      history.push({
        role: 'function',
        name: funcName,
        content: JSON.stringify(docs)
      } as any as ChatCompletionMessageParam);

      // 3️⃣ Stream the follow-up response
      const secondStream = await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: history,
        stream: true
      });

      for await (const chunk of secondStream) {
        const delta = chunk.choices[0].delta;
        if (delta?.content) {
          writeChunk(res, delta.content);
        }
      }
    }

    // Final end
    res.write('event: end\ndata: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Chat route error:', err);
    res.write(`data: [ERROR] ${err.message}\n\n`);
    res.end();
  }
});

export default router;
