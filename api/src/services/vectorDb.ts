import knex from '../config/db';
import pgvector from 'pgvector/pg';

/**
 * Save a text chunk and its embedding into the documentchunk table.
 */
export async function saveChunk(
  documentId: string,
  chunkIndex: number,
  text: string,
  embedding: number[]
) {
  console.log(`Saving chunk ${chunkIndex} for doc id: ${documentId}`);
  const vectorLiteral = `[${embedding.join(',')}]`;
  await knex.raw(
    `INSERT INTO documentchunk (text, embedding, chunk_index, document_id)
     VALUES (?, ?::vector, ?, ?)`,
    [text, vectorLiteral, chunkIndex, documentId]
  );
}

/**
 * Query the top-N most similar chunks by cosine distance to a given embedding.
 */
export async function querySimilar(
  queryEmbedding: number[],
  limit = 5
): Promise<Array<{ id: number; text: string; embedding: string }>> {
  const vectorLiteral = pgvector.toSql(queryEmbedding); // e.g. "[0.1,0.2,...]"
  const sql = `
    SELECT
      id,
      text,
      embedding::text AS embedding
    FROM documentchunk
    ORDER BY embedding <-> '${vectorLiteral}'::vector
    LIMIT ?
  `;
  const result = await knex.raw(sql, [limit]);
  // knex.raw returns different shapes depending on driver; Postgres returns { rows }
  return result.rows || result;
}
