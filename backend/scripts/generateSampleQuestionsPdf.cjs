/**
 * generateSampleQuestionsPdf.cjs
 * ---------------------------------
 * Generates a realistic sample "question paper" PDF that you can upload into the
 * LastMin AI app (Syllabus / Upload page) to test the Notes + Quiz generation pipeline.
 *
 * Uses the `pdfkit` package already installed in backend/node_modules.
 * Output: <repo-root>/pdf/sample-questions.pdf
 *
 * Run:
 *   node backend/scripts/generateSampleQuestionsPdf.cjs
 *   (or from repo root: npm run generate:sample-pdf)
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Resolve to <repo-root>/pdf (this script lives in backend/scripts)
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'pdf');
const outFile = path.join(outDir, 'sample-questions.pdf');

fs.mkdirSync(outDir, { recursive: true });

const doc = new PDFDocument({ margin: 50, size: 'A4' });

const stream = fs.createWriteStream(outFile);
doc.pipe(stream);

// ---------------------------------------------------------------- helpers
const H1 = (text) => {
  doc.fontSize(20).font('Helvetica-Bold').text(text, { align: 'center' });
  doc.moveDown(0.5);
};

const H2 = (text) => {
  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica-Bold').text(text, { underline: true });
  doc.moveDown(0.3);
};

const P = (text) => {
  doc.fontSize(11).font('Helvetica').text(text, { align: 'left' });
  doc.moveDown(0.2);
};

const bullet = (text) => {
  doc.fontSize(11).font('Helvetica').text(text, { indent: 15, bulletRadius: 2 });
  doc.moveDown(0.15);
};

// ---------------------------------------------------------------- content
H1('LastMin AI - Sample Question Paper');
doc.fontSize(12).font('Helvetica-Oblique').text('Subject: General Science & Mathematics', { align: 'center' });
doc.fontSize(11).font('Helvetica').text('Time: 60 minutes     Total Marks: 50', { align: 'center' });
doc.moveDown(1);

H2('Section A: Multiple Choice Questions');
doc.fontSize(10).font('Helvetica-Oblique').text('Choose the correct option (a, b, c or d).', { indent: 10 });
doc.moveDown(0.3);

const mcqs = [
  {
    q: '1. What is the chemical formula for water?',
    options: ['a) H2O', 'b) CO2', 'c) O2', 'd) NaCl'],
    ans: 'a) H2O',
  },
  {
    q: '2. What is 7 multiplied by 8?',
    options: ['a) 54', 'b) 56', 'c) 63', 'd) 49'],
    ans: 'b) 56',
  },
  {
    q: '3. Which planet is known as the Red Planet?',
    options: ['a) Venus', 'b) Mars', 'c) Jupiter', 'd) Saturn'],
    ans: 'b) Mars',
  },
  {
    q: '4. What is the approximate speed of light in a vacuum?',
    options: ['a) 3 x 10^8 m/s', 'b) 3 x 10^6 m/s', 'c) 3 x 10^10 m/s', 'd) 3 x 10^5 m/s'],
    ans: 'a) 3 x 10^8 m/s',
  },
  {
    q: '5. Which organelle is called the powerhouse of the cell?',
    options: ['a) Nucleus', 'b) Ribosome', 'c) Mitochondria', 'd) Golgi apparatus'],
    ans: 'c) Mitochondria',
  },
];

mcqs.forEach((item) => {
  P(item.q);
  item.options.forEach((o) => bullet(o));
  doc.moveDown(0.2);
});

H2('Section B: Short Answer Questions');
const short = [
  '6. Define photosynthesis in a single sentence.',
  '7. State Newton\'s First Law of Motion.',
  '8. Write the formula for the area of a circle.',
  '9. Name the three states of matter.',
  '10. What gas do plants absorb from the atmosphere during photosynthesis?',
];
short.forEach((s) => P(s));

H2('Section C: Long Answer Questions');
const long = [
  '11. Explain the process of photosynthesis and describe why it is essential for life on Earth.',
  '12. Describe the water cycle, including evaporation, condensation, precipitation and collection.',
];
long.forEach((l) => P(l));

H2('Answer Key');
doc.fontSize(11).font('Helvetica').text(
  [
    '1. ' + mcqs[0].ans,
    '2. ' + mcqs[1].ans,
    '3. ' + mcqs[2].ans,
    '4. ' + mcqs[3].ans,
    '5. ' + mcqs[4].ans,
    '6. Photosynthesis is the process by which green plants use sunlight, water and carbon dioxide to make glucose and oxygen.',
    '7. An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by an external force.',
    '8. Area = pi x r squared (A = pi r^2).',
    '9. Solid, liquid and gas.',
    '10. Carbon dioxide (CO2).',
    '11. Photosynthesis converts light energy into chemical energy stored in glucose; it produces the oxygen we breathe and forms the base of most food chains.',
    '12. The water cycle moves water between the ocean, atmosphere and land: water evaporates, rises and cools into clouds (condensation), falls as rain or snow (precipitation), and collects in rivers and oceans (collection).',
  ].join('\n'),
  { lineGap: 4 }
);

doc.end();

stream.on('finish', () => {
  console.log('✅ Sample question paper generated at:');
  console.log('   ' + outFile);
  console.log('\nUpload it in the app (Syllabus → Upload Document) to test Notes & Quiz generation.');
});

stream.on('error', (err) => {
  console.error('❌ Failed to write PDF:', err);
  process.exit(1);
});
