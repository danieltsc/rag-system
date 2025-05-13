import { Request, Response, Router } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import knex from '../config/db';
import { processDocument } from '../services/document';

const upload = multer({ dest: '/tmp/uploads' });
const router = Router();

// helper to extract raw text from different file types
async function extractText(filePath: string, ext: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  switch (ext.toLowerCase()) {
    case '.pdf': {
      const { text } = await pdf(buffer);
      return text;
    }
    case '.docx': {
      const { value: text } = await mammoth.extractRawText({ buffer });
      return text;
    }
    case '.md':
    case '.txt':
    default:
      return buffer.toString('utf8');
  }
}

// 1) File upload endpoint
router.post('/file', upload.array('files'), async (req, res) => {
  try {
    const results: any[] = [];

    for (const file of req.files as Express.Multer.File[]) {
      const document_id = uuid();
      const ext = path.extname(file.originalname);
      const text = await extractText(file.path, ext);
      const chunkCount = await processDocument(document_id, text);
      results.push({ originalName: file.originalname, document_id, chunkCount });
      await fs.unlink(file.path);
    }

    res.status(201).json({ message: 'Files processed', results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// 2) Plain-text paste endpoint
router.post('/text', async (req, res) => {
  try {
    const { text } = req.body as { text: string };
    const document_id = uuid();
    const chunkCount = await processDocument(document_id, text);

    res.status(201).json({ message: 'Text embedded', document_id, chunkCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Text upload failed' });
  }
});

// 3) List documents with pagination
router.get('/content', async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    if (page < 1 || limit < 1) {
      res.status(400).json({ error: 'Invalid pagination parameters' });
      return;
    }

    const offset = (page - 1) * limit;
    const docs = await knex('documentchunk as dc')
      .select('dc.document_id')
      .count('* as chunkCount')
      .select(
        knex.raw(`(
          SELECT text FROM documentchunk sub
          WHERE sub.document_id = dc.document_id
          ORDER BY sub.chunk_index ASC
          LIMIT 1
        ) as text`)
      )
      .groupBy('dc.document_id')
      .offset(offset)
      .limit(limit);

    const totalRes = await knex('documentchunk')
      .countDistinct('document_id as count');
    const totalCount = parseInt((totalRes[0] as any).count, 10);
    if (totalCount === 0) {
      res.status(404).json({ error: 'No documents found' });
      return;
    }
    const totalPages = Math.ceil(totalCount / limit);

    const results = docs.map(d => ({
      documentId: d.document_id,
      chunkCount: parseInt((d as any).chunkCount, 10),
      text: d.text,
    }));

    res.json({ page, limit, totalCount, totalPages, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not list documents' });
  }
});

// 4) Get paginated chunks and fullText
router.get('/content/:document_id', async (req, res) => {
  try {
    const { document_id } = req.params;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    if (page < 1 || limit < 1) {
      res.status(400).json({ error: 'Invalid pagination parameters' });
      return
    }

    const totalRes = await knex('documentchunk')
      .where({ document_id })
      .count('* as count');
    const totalCount = parseInt((totalRes[0] as any).count, 10);
    if (totalCount === 0) {
      res.status(404).json({ error: 'Document not found' });
      return
    }

    const chunks = await knex('documentchunk')
      .where({ document_id })
      .orderBy('chunk_index', 'asc')
      .offset((page - 1) * limit)
      .limit(limit)
      .select('chunk_index as chunkIndex', 'text', 'id');

    const totalPages = Math.ceil(totalCount / limit);
    let fullText: string | undefined;
    if (page === 1 && chunks.length === totalCount) {
      fullText = chunks.map(c => c.text).join('\n\n');
    }

    res.json({
      document_id,
      page,
      limit,
      totalCount,
      totalPages,
      chunks,
      ...(fullText && { fullText }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch content' });
  }
});

// 5) Delete all chunks for a document
router.delete('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await knex('documentchunk')
      .where({ document_id: id })
      .del();

    if (deletedCount === 0) {
      res.status(404).json({ error: 'Document not found' });
      return
    }

    res.json({ message: 'Document deleted', deletedChunks: deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// 6) Update document content: deletes old chunks and reprocesses new text
router.put('/content/:document_id', async (req, res) => {
  try {
    const { document_id } = req.params;
    const { text } = req.body as { text: string };

    await knex('documentchunk')
      .where({ document_id })
      .del();

    const chunkCount = await processDocument(document_id, text);

    res.json({ message: 'Document updated', document_id, chunkCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
