// src/pages/chat.tsx
'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import styled from 'styled-components';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { v4 as uuidv4 } from 'uuid';

import 'highlight.js/styles/github.css';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  feedback?: 'like' | 'dislike';
  feedbackText?: string;
}

const ChatContainer = styled.main`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  overflow: scroll;
`;

const Title = styled.h2`
  margin-bottom: 0.25rem;
  text-align: center;
  font-size: 1.5rem;
`;
const Caption = styled.p`
  margin-bottom: 1rem;
  text-align: center;
  color: #666;
`;

const MessagesList = styled.div`
  flex: 1;
  overflow-y: scroll;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled.div<{ sender: 'user' | 'bot' }>`
  max-width: 70%;
  min-width: 400px;
  margin-bottom: 1.5rem;
  padding: 1rem;
  line-height: 1.6;
  background: ${({ sender }) => (sender === 'user' ? '#0070f3' : '#e5e5ea')};
  color: ${({ sender }) => (sender === 'user' ? 'white' : 'black')};
  align-self: ${({ sender }) => (sender === 'user' ? 'flex-end' : 'flex-start')};
  border-radius: 16px;
  position: relative;

  /* preserve Markdown whitespace and wrapping */
  white-space: pre-wrap;
  word-break: break-word;

  /* paragraphs */
  p { margin: 0.75em 0; }
  code {
    background: rgba(27, 31, 35, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: Menlo, monospace;
    font-size: 0.9em;
  }
  pre {
    margin: 1em 0;
    padding: 1em;
    background: #f6f8fa;
    border-radius: 6px;
    overflow-x: auto;
    font-family: Menlo, monospace;
  }
`;

const FeedbackContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  svg {
    cursor: pointer;
    margin-right: 0.5rem;
  }
  svg.liked { color: green; }
  svg.disliked { color: red; }
`;

const FeedbackTextarea = styled.textarea`
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: sans-serif;
  font-size: 0.9rem;
  resize: vertical;
`;

const InputForm = styled.form`
  display: flex;
  border-top: 1px solid #eee;
  padding: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 24px;
  font-size: 1rem;
  outline: none;
  &:focus { border-color: #0070f3; }
`;

const SendButton = styled.button`
  margin-left: 0.5rem;
  padding: 0 1.5rem;
  background: #0070f3;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  cursor: pointer;
  &:hover { background: #005bb5; }
`;

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('sessionId', id);
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMsg: Message = { id: uuidv4(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const params = new URLSearchParams({ sessionId, message: input });
    const es = new EventSource(`http://localhost:4000/api/chat?${params}`);
    const botId = uuidv4();
    setMessages(prev => [...prev, { id: botId, sender: 'bot', text: '' }]);
    let acc = '';

    es.onmessage = event => {
      const data = event.data;
      if (data === '[DONE]') {
        es.close();
      } else if (data.startsWith('[ERROR]')) {
        es.close(); setBotText(botId, 'Sorry, something went wrong.');
      } else {
        acc += data;
        setBotText(botId, acc);
      }
    };
    es.onerror = () => { es.close(); };
  }

  const setBotText = (id: string, text: string) => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, text } : m));
  };

  const handleFeedback = (msgId: string, type: 'like' | 'dislike') => {
    setMessages(msgs => msgs.map(m => m.id === msgId ? { ...m, feedback: type } : m));
  };

  return (
    <>
      <Header />
      <ChatContainer>
        <Title>Support Chat</Title>
        <Caption>Ask me anything about integration, I’m here to help!</Caption>
        <MessagesList>
          {messages.map(msg => (
            <MessageBubble sender={msg.sender}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
              >
                {msg.text}
              </ReactMarkdown>
              {msg.sender === 'bot' && (
                <FeedbackContainer>
                  <ThumbsUp
                    size={18}
                    className={msg.feedback === 'like' ? 'liked' : ''}
                    onClick={() => handleFeedback(msg.id, 'like')}
                  />
                  <ThumbsDown
                    size={18}
                    className={msg.feedback === 'dislike' ? 'disliked' : ''}
                    onClick={() => handleFeedback(msg.id, 'dislike')}
                  />
                </FeedbackContainer>
              )}
            </MessageBubble>
          ))}
          <div ref={messagesEndRef} />
        </MessagesList>

        <InputForm onSubmit={handleSend}>
          <Input
            type="text"
            placeholder="Type your question…"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <SendButton type="submit">Send</SendButton>
        </InputForm>
      </ChatContainer>
    </>
  );
}