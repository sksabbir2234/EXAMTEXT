import { db, collection, doc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, query, where, serverTimestamp } from './firebase-config.js';
import { slugify, getExamUrl, copyToClipboard, showToast } from './utils.js';

let parsedData = null;

const jsonFile = document.getElementById('json-file');
const jsonText = document.getElementById('json-text');
const previewBtn = document.getElementById('preview-btn');
const previewArea = document.getElementById('preview-area');
const previewContent = document.getElementById('preview-content');
const confirmBtn = document.getElementById('confirm-btn');
const uploadResult = document.getElementById('upload-result');
const manageList = document.getElementById('manage-list');

jsonFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    jsonText.value = ev.target.result;
  };
  reader.readAsText(file);
});

previewBtn.addEventListener('click', () => {
  const raw = jsonText.value.trim();
  if (!raw) {
    showToast('Please provide JSON data');
    return;
  }
  try {
    parsedData = JSON.parse(raw);
    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      showToast('Invalid format: missing questions array');
      parsedData = null;
      return;
    }
    let html = `<strong>Subject:</strong> ${parsedData.subject || 'N/A'}<br>`;
    html += `<strong>Title:</strong> ${parsedData.examTitle || 'N/A'}<br>`;
    html += `<strong>Duration:</strong> ${parsedData.durationMinutes || 0} min<br>`;
    html += `<strong>Questions:</strong> ${parsedData.questions.length}<br><br>`;
    parsedData.questions.forEach((q, i) => {
      html += `<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #eee;">`;
      html += `<strong>Q${i + 1}:</strong> ${q.questionText}<br>`;
      const labels = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, oi) => {
        const marker = oi === q.correctOptionIndex ? ' ✓' : '';
        html += `<span style="margin-left:10px;">${labels[oi]}. ${opt}${marker}</span><br>`;
      });
      if (q.explanation) html += `<em style="color:#666;">Explanation:</em> ${q.explanation}`;
      html += `</div>`;
    });
    previewContent.innerHTML = html;
    previewArea.style.display = 'block';
  } catch (err) {
    showToast('Invalid JSON: ' + err.message);
    parsedData = null;
  }
});

confirmBtn.addEventListener('click', async () => {
  if (!parsedData) return;
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Uploading...';

  try {
    const subjectSlug = slugify(parsedData.subject || 'general');
    const subjectRef = doc(db, 'subjects', subjectSlug);
    await setDoc(subjectRef, {
      name: parsedData.subject || 'General',
      slug: subjectSlug,
      description: '',
      createdAt: serverTimestamp()
    }, { merge: true });

    const examRef = doc(collection(db, 'exams'));
    await setDoc(examRef, {
      subjectId: subjectSlug,
      title: parsedData.examTitle || 'Untitled Exam',
      slug: slugify(parsedData.examTitle || 'untitled'),
      durationMinutes: parsedData.durationMinutes || 0,
      totalQuestions: parsedData.questions.length,
      createdAt: serverTimestamp(),
      published: true
    });

    const batch = writeBatch(db);
    parsedData.questions.forEach((q, i) => {
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

    const examUrl = getExamUrl(examRef.id);
    uploadResult.innerHTML = `
      <div class="admin-section" style="background:#d4edda;">
        <h3 style="color:#155724;">Upload Successful!</h3>
        <p style="margin:10px 0;">Shareable exam link:</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <input type="text" value="${examUrl}" readonly style="flex:1;padding:8px;border:1px solid #ccc;border-radius:6px;font-size:0.85rem;">
          <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${examUrl}');showToast('Copied!')">Copy</button>
        </div>
        <div class="share-buttons" style="margin-top:12px;">
          <button class="share-btn facebook" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(examUrl)}','_blank')">Facebook</button>
          <button class="share-btn whatsapp" onclick="window.open('https://wa.me/?text=${encodeURIComponent(parsedData.examTitle + '\n' + examUrl)}','_blank')">WhatsApp</button>
        </div>
      </div>`;
    showToast('Exam uploaded successfully!');
    loadManageList();
  } catch (err) {
    uploadResult.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
    console.error(err);
  }

  confirmBtn.disabled = false;
  confirmBtn.textContent = 'Confirm Upload';
});

async function loadManageList() {
  try {
    const subSnap = await getDocs(collection(db, 'subjects'));
    if (subSnap.empty) {
      manageList.innerHTML = `<p style="color:#888;">No subjects yet.</p>`;
      return;
    }

    let html = '';
    for (const subDoc of subSnap.docs) {
      const sub = subDoc.data();
      html += `<div style="margin-bottom:16px;"><strong>${sub.name}</strong></div>`;

      const examSnap = await getDocs(query(collection(db, 'exams'), where('subjectId', '==', subDoc.id)));
      if (examSnap.empty) {
        html += `<p style="color:#888;margin-bottom:16px;">No exams.</p>`;
        continue;
      }

      examSnap.forEach(examDoc => {
        const e = examDoc.data();
        const checked = e.published ? 'checked' : '';
        html += `
          <div class="exam-list-item">
            <div>
              <strong>${e.title}</strong><br>
              <small>${e.totalQuestions} questions | ${e.durationMinutes || 0} min</small>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <label class="toggle-switch">
                <input type="checkbox" ${checked} onchange="window._togglePub('${examDoc.id}', this.checked)">
                <span class="toggle-slider"></span>
              </label>
              <button class="btn btn-danger" style="padding:6px 12px;font-size:0.8rem;" onclick="window._deleteExam('${examDoc.id}')">Delete</button>
            </div>
          </div>`;
      });
    }
    manageList.innerHTML = html;
  } catch (err) {
    manageList.innerHTML = `<p style="color:red;">Error loading data.</p>`;
    console.error(err);
  }
}

window._togglePub = async (examId, published) => {
  try {
    await updateDoc(doc(db, 'exams', examId), { published });
    showToast(published ? 'Published' : 'Unpublished');
  } catch (err) {
    console.error(err);
  }
};

window._deleteExam = async (examId) => {
  if (!confirm('Delete this exam and all its questions?')) return;
  try {
    const qSnap = await getDocs(collection(db, 'exams', examId, 'questions'));
    const batch = writeBatch(db);
    qSnap.forEach(d => batch.delete(d.ref));
    await batch.commit();
    await deleteDoc(doc(db, 'exams', examId));
    showToast('Exam deleted');
    loadManageList();
  } catch (err) {
    console.error(err);
  }
};

loadManageList();
