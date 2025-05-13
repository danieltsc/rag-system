// src/config/db.ts
import knex from 'knex'

// Initialize Knex with Postgres connection
const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
})

// On startup, ensure both pgvector and our table exist
async function ensureSchema() {
  try {
    console.log('▶ Ensuring pgvector extension...')
    await db.raw('CREATE EXTENSION IF NOT EXISTS vector;')
    console.log('✔ pgvector extension is present')
  } catch (err) {
    console.warn('⚠ Could not ensure pgvector extension (need superuser?):', err)
  }

  const has = await db.schema.hasTable('documentchunk')
  if (!has) {
    console.log('▶ Creating table documentchunk...')
    await db.schema.createTable('documentchunk', (table) => {
      table.increments('id').primary()
      table.text('text').notNullable()
      // 1536 is a common OpenAI embedding size; adjust if yours differs
      table.specificType('embedding', 'vector(1536)').notNullable()
      table.integer('chunk_index').notNullable()
      table
        .string('document_id')
        .notNullable()
    })
    console.log('✔ Table documentchunk created')
  } else {
    console.log('✔ Table documentchunk already exists')
  }
}

// fire-and-forget
ensureSchema().catch((err) => {
  console.error('‼ Failed to initialize schema:', err)
})

export default db
