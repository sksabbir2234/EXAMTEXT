import { db, collection, doc, setDoc, writeBatch, serverTimestamp } from './firebase-config.js';
import { slugify } from './utils.js';

const logDiv = document.getElementById('log');
const uploadBtn = document.getElementById('upload-btn');

function log(msg, type = 'info') {
  logDiv.style.display = 'block';
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logDiv.appendChild(entry);
  logDiv.scrollTop = logDiv.scrollHeight;
}

const exams = [
  { file: 'cse/chapter1-data-structures.json', title: 'Chapter 1 - Data Structures' },
  { file: 'cse/chapter2-algorithms.json', title: 'Chapter 2 - Algorithms' },
  { file: 'cse/chapter3-operating-systems.json', title: 'Chapter 3 - Operating Systems' },
  { file: 'cse/chapter4-dbms.json', title: 'Chapter 4 - Database Management Systems' },
  { file: 'cse/chapter5-computer-networks.json', title: 'Chapter 5 - Computer Networks' },
  { file: 'cse/chapter6-software-engineering.json', title: 'Chapter 6 - Software Engineering' },
  { file: 'cse/chapter7-oop.json', title: 'Chapter 7 - Object Oriented Programming' },
  { file: 'cse/chapter8-theory-of-computation.json', title: 'Chapter 8 - Theory of Computation' },
  { file: 'cse/chapter9-compiler-design.json', title: 'Chapter 9 - Compiler Design' },
  { file: 'cse/chapter10-digital-logic.json', title: 'Chapter 10 - Digital Logic & Architecture' }
];

uploadBtn.addEventListener('click', async () => {
  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';
  log('Starting upload of 10 CSE exams...', 'info');

  let success = 0;
  let failed = 0;

  for (const exam of exams) {
    try {
      log(`Loading ${exam.file}...`, 'info');
      const res = await fetch(exam.file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const subjectSlug = slugify(data.subject || 'cse-college-teacher');
      await setDoc(doc(db, 'subjects', subjectSlug), {
        name: data.subject || 'CSE College Teacher',
        slug: subjectSlug,
        description: 'College Teacher Recruitment - Computer Science & Engineering',
        createdAt: serverTimestamp()
      }, { merge: true });

      const examRef = doc(collection(db, 'exams'));
      await setDoc(examRef, {
        subjectId: subjectSlug,
        title: data.examTitle,
        slug: slugify(data.examTitle),
        durationMinutes: data.durationMinutes || 0,
        totalQuestions: data.questions.length,
        createdAt: serverTimestamp(),
        published: true
      });

      const batch = writeBatch(db);
      data.questions.forEach((q, i) => {
        const qRef = doc(collection(db, 'exams', examRef.id, 'questions'));
        batch.set(qRef, {
          order: i + 1,
          questionText: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation || null,
          marks: q.marks || 1
        });
      });
      await batch.commit();

      log(`✓ Uploaded: ${data.examTitle} (${data.questions.length} questions)`, 'success');
      success++;
    } catch (err) {
      log(`✗ Failed: ${exam.title} - ${err.message}`, 'error');
      failed++;
    }
  }

  log(`\nDone! ${success} uploaded, ${failed} failed.`, success === 10 ? 'success' : 'error');
  uploadBtn.textContent = 'Upload Complete';
});
