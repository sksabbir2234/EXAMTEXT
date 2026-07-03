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
  { file: 'ntrca-chapter1.json', title: 'Chapter 1 - Communication System' },
  { file: 'ntrca-chapter2.json', title: 'Chapter 2 - Data Communication' },
  { file: 'ntrca-chapter3.json', title: 'Chapter 3 - Computer Network' },
  { file: 'ntrca-chapter4.json', title: 'Chapter 4 - Network Security' },
  { file: 'ntrca-chapter5.json', title: 'Chapter 5 - Number System' },
  { file: 'ntrca-chapter6.json', title: 'Chapter 6 - Boolean Algebra & Logic Gates' },
  { file: 'ntrca-chapter7.json', title: 'Chapter 7 - Database Management System' },
  { file: 'ntrca-chapter8.json', title: 'Chapter 8 - Programming Concepts' },
  { file: 'ntrca-chapter9.json', title: 'Chapter 9 - Web Technology' },
  { file: 'ntrca-chapter10.json', title: 'Chapter 10 - Society and ICT' }
];

uploadBtn.addEventListener('click', async () => {
  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';
  log('Starting upload of 10 exams...', 'info');

  let success = 0;
  let failed = 0;

  for (const exam of exams) {
    try {
      log(`Loading ${exam.file}...`, 'info');
      const res = await fetch(exam.file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const subjectSlug = slugify(data.subject || 'hsc-ict');
      await setDoc(doc(db, 'subjects', subjectSlug), {
        name: data.subject || 'HSC ICT',
        slug: subjectSlug,
        description: 'Higher Secondary Certificate - Information & Communication Technology',
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
