import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

function getProblems() {
  return [
    {
      title: 'Intermittent Network Errors',
      detail: 'Axios reports Network Error when backend crashes, CORS rejects an origin, or the server is not running.',
      action: 'Verify backend up (/health), confirm CORS origin, check nodemon stack trace.'
    },
    {
      title: 'Server Crash Under Nodemon',
      detail: 'Nodemon restarts with no visible stack earlier; need the stack to debug (often Mongo not running or uncaught init error).',
      action: 'Run backend alone, capture first error lines, ensure MongoDB service started.'
    },
    {
      title: 'CORS Origin Mismatch',
      detail: 'Frontend on a different localhost port not originally whitelisted triggered CORS failure.',
      action: 'Dynamic localhost allowance added; keep FRONTEND_URL accurate.'
    },
    {
      title: 'Unstructured AI Analysis Output',
      detail: 'Analyze endpoint returns raw text only; UI cannot extract key topics/difficulty.',
      action: 'Add parser to extract JSON (topics, difficulty, concepts).'
    },
    {
      title: 'Quiz JSON Robustness',
      detail: 'Quiz generation attempts naive JSON slice; may return raw text on parse failure.',
      action: 'Implement schema validation & regeneration fallback.'
    },
    {
      title: 'Missing Persistence of Generated Notes',
      detail: 'Generated notes/analysis not saved to database.',
      action: 'Add Notes model fields and save on /analyze or /summarize.'
    },
    {
      title: 'Environment Variable Hygiene',
      detail: 'Real GEMINI_API_KEY present in .env; ensure .env is gitignored and rotate key if exposed.',
      action: 'Keep .env out of VCS, rotate key if committed.'
    },
    {
      title: 'Fallback AI Provider',
      detail: 'No fallback when Gemini key missing; requests 500.',
      action: 'Implement conditional OpenAI fallback or graceful 503.'
    }
  ];
}

router.get('/problems.pdf', async (req, res) => {
  const problems = getProblems();
  let PDFDocument;
  try {
    ({ default: PDFDocument } = await import('pdfkit'));
  } catch (e) {
    return res.status(503).json({ success: false, error: 'pdfkit module not installed. Run `npm install` in backend folder.' });
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const publicDir = path.join(__dirname, '..', '..', 'public'); // root/public
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const fileName = 'problems-report.pdf';
  const filePath = path.join(publicDir, fileName);

  const doc = new PDFDocument({ margin: 50 });
  const fileStream = fs.createWriteStream(filePath);
  doc.pipe(fileStream);

  doc.fontSize(20).text('LastMin AI - Current Issues Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).fillColor('#555').text(`Generated: ${new Date().toISOString()}`);
  doc.moveDown();

  problems.forEach((p, idx) => {
    doc.fillColor('#000').fontSize(14).text(`${idx + 1}. ${p.title}`);
    doc.moveDown(0.25);
    doc.fontSize(11).fillColor('#222').text('Description:', { continued: true }).fillColor('#444').text(` ${p.detail}`);
    doc.fontSize(11).fillColor('#222').text('Recommended Action:', { continued: true }).fillColor('#0a5').text(` ${p.action}`);
    doc.moveDown();
  });

  doc.end();

  fileStream.on('finish', () => {
    return res.json({ success: true, path: '/public/' + fileName, saved: true });
  });
  fileStream.on('error', (err) => {
    return res.status(500).json({ success: false, error: 'Failed to write PDF: ' + err.message });
  });
});

export default router;
