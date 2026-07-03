import { db, collection, doc, getDoc, getDocs, query, where } from './firebase-config.js';
import { getParam } from './utils.js';

const subjectId = getParam('id');
const examsList = document.getElementById('exams-list');
const subjectName = document.getElementById('subject-name');
const subjectDesc = document.getElementById('subject-desc');

if (!subjectId) {
  location.href = 'index.html';
}

async function loadSubject() {
  try {
    const snap = await getDoc(doc(db, 'subjects', subjectId));
    if (!snap.exists()) {
      examsList.innerHTML = `<div class="empty-state"><p>Subject not found.</p></div>`;
      return;
    }
    const s = snap.data();
    subjectName.textContent = s.name;
    subjectDesc.textContent = s.description || '';
    document.title = s.name + ' - Exam Portal';
  } catch (err) {
    console.error(err);
  }
}

async function loadExams() {
  try {
    const q = query(
      collection(db, 'exams'),
      where('subjectId', '==', subjectId),
      where('published', '==', true)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      examsList.innerHTML = `<div class="empty-state"><p>No exams available for this subject yet.</p></div>`;
      return;
    }
    let html = '';
    snap.forEach(d => {
      const e = d.data();
      const dur = e.durationMinutes > 0 ? `${e.durationMinutes} min` : 'Untimed';
      html += `
        <div class="card" onclick="location.href='exam-intro.html?id=${d.id}'">
          <h3>${e.title}</h3>
          <div class="meta">
            <span>${e.totalQuestions} questions</span>
            <span>${dur}</span>
          </div>
        </div>`;
    });
    examsList.innerHTML = html;
  } catch (err) {
    examsList.innerHTML = `<div class="empty-state"><p>Error loading exams.</p><p style="font-size:0.75rem;color:red;">${err.message}</p></div>`;
    console.error(err);
  }
}

loadSubject();
loadExams();
