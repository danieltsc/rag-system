# RAG Search Bot

A Retrieval-Augmented Generation (RAG) system using Knex, PostgreSQL, Node.js, OpenAI, and an agentic OpenAI approach, with a Next.js frontend for smart search capabilities.

## Overview

This project allows users to:

- Upload files or enter pure text via a settings page in the Next.js client.
- Ingest the uploaded knowledge base.
- Chat with a bot through a chat page, asking questions about the ingested content and receiving relevant answers.

## Technical Requirements

- Node.js (v16+)
- Yarn or npm
- PostgreSQL instance

## Setup and Run Instructions

### API Server

1. Navigate to the `api` folder:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   yarn
   # or
   npm install
   ```

3. Configure the database connection:
   - Open `api/src/config/db.ts`.
   - Update the connection URL to match your PostgreSQL instance (e.g., `postgres://user:password@localhost:5432/mydb`).

4. Configure OpenAI connection
   - Create an env file `api/.env`
   - Add the `OPENAI_KEY` (one can be generated on OpenAI Platform)

5. Start the development server:
   ```bash
   yarn start:dev
   # or
   npm run start:dev
   ```


### Client Server

1. Navigate to the `client` folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   yarn
   # or
   npm install
   ```

3. Start the development server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

## Notes

- Ensure your PostgreSQL instance is running and accessible.
- The `db.ts` file in the API folder must have the correct connection URL before starting the API server.
