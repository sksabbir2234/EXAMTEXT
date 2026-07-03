import { db, collection, doc, getDocs, query, where } from './firebase-config.js';
import { showToast, getExamUrl, shareFacebook, shareWhatsApp, copyToClipboard } from './utils.js';

const container = document.getElementById('exams-list');

async function loadExams() {
  try {
    const subSnap = await getDocs(query(collection(db, 'subjects'), where('slug', '==', 'cse-college-teacher')));
    
    if (subSnap.empty) {
      container.innerHTML = `<div class="empty-state"><p>No CSE exams found. Upload first from <a href="auto-upload-cse.html">Auto Upload</a>.</p></div>`;
      return;
    }

    const subjectId = subSnap.docs[0].id;
    const examSnap = await getDocs(query(collection(db, 'exams'), where('subjectId', '==', subjectId), where('published', '==', true)));

    if (examSnap.empty) {
      container.innerHTML = `<div class="empty-state"><p>No exams published yet.</p></div>`;
      return;
    }

    let html = '';
    const exams = [];
    examSnap.forEach(d => exams.push({ id: d.id, ...d.data() }));
    exams.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    exams.forEach(e => {
      const url = getExamUrl(e.id);
      html += `
        <div class="exam-row">
          <div class="exam-name">${e.title}</div>
          <div class="exam-meta">${e.totalQuestions} Q | ${e.durationMinutes || 0} min</div>
          <div class="link-box">
            <input type="text" class="link-input" value="${url}" readonly onclick="this.select()">
            <button class="copy-btn" onclick="copyToClipboard('${url}')">Copy</button>
            <div class="share-btns">
              <button class="share-sm fb" onclick="shareFacebook('${url}','${e.title}')">FB</button>
              <button class="share-sm wa" onclick="shareWhatsApp('${url}','${e.title}')">WA</button>
            </div>
          </div>
        </div>`;
    });

    container.innerHTML = html;
    window.copyToClipboard = copyToClipboard;
    window.shareFacebook = shareFacebook;
    window.shareWhatsApp = shareWhatsApp;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Error: ${err.message}</p></div>`;
    console.error(err);
  }
}

loadExams();
