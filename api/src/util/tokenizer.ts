import { encoding_for_model } from '@dqbd/tiktoken';

const encoder = encoding_for_model('text-embedding-ada-002');
export function countTokens(text: string): number {
  return encoder.encode(text).length;
}
