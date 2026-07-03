import { db, doc, getDoc } from './firebase-config.js';
import { getParam } from './utils.js';

const examId = getParam('id');
const examInfo = document.getElementById('exam-info');
const examTitle = document.getElementById('exam-title');
const examSubject = document.getElementById('exam-subject');
const form = document.getElementById('name-form');
const nameInput = document.getElementById('student-name');

if (!examId) {
  location.href = 'index.html';
}

let examData = null;

async function loadExam() {
  try {
    const snap = await getDoc(doc(db, 'exams', examId));
    if (!snap.exists()) {
      examInfo.innerHTML = `<div class="empty-state"><p>Exam not found.</p></div>`;
      return;
    }
    examData = snap.data();
    examTitle.textContent = examData.title;
    document.title = examData.title + ' - Exam Portal';

    let subjectName = '';
    try {
      const subSnap = await getDoc(doc(db, 'subjects', examData.subjectId));
      if (subSnap.exists()) subjectName = subSnap.data().name;
    } catch {}

    examSubject.textContent = subjectName;
    const dur = examData.durationMinutes > 0 ? `${examData.durationMinutes} minutes` : 'No time limit';
    examInfo.innerHTML = `
      <div style="display:flex;gap:30px;justify-content:center;flex-wrap:wrap;">
        <div class="stat-item">
          <div class="stat-value blue">${examData.totalQuestions}</div>
          <div class="stat-label">Questions</div>
        </div>
        <div class="stat-item">
          <div class="stat-value blue">${dur}</div>
          <div class="stat-label">Duration</div>
        </div>
      </div>`;

    const saved = sessionStorage.getItem('studentName');
    if (saved) nameInput.value = saved;
  } catch (err) {
    examInfo.innerHTML = `<div class="empty-state"><p>Error loading exam.</p><p style="font-size:0.75rem;color:red;">${err.message}</p></div>`;
    console.error(err);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  sessionStorage.setItem('studentName', name);
  location.href = `exam.html?id=${examId}`;
});

loadExam();
