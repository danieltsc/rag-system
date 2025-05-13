import { MAX_EMBED_TOKENS } from "../constants/constants";
import { embedText } from "../util/embeddings";
import { splitText } from "../util/splitter";
import { countTokens } from "../util/tokenizer";
import { saveChunk } from "./vectorDb";

// shared processing logic for any full document text
export async function processDocument(document_id: string, fullText: string) {
  const chunks =
    countTokens(fullText) <= MAX_EMBED_TOKENS
      ? [fullText]
      : await splitText(fullText);

  await Promise.all(
    chunks.map(async (chunk, idx) => {
      const embedding = await embedText(chunk);
      await saveChunk(document_id, idx, chunk, embedding);
    })
  );

  return chunks.length;
}