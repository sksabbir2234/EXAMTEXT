import { db, collection, getDocs } from './firebase-config.js';
import { } from './utils.js';

const container = document.getElementById('subjects-list');

async function loadSubjects() {
  try {
    const snap = await getDocs(collection(db, 'subjects'));
    if (snap.empty) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No subjects available yet.</p>
        </div>`;
      return;
    }
    let html = '';
    snap.forEach(d => {
      const s = d.data();
      html += `
        <div class="card" onclick="location.href='subject.html?id=${d.id}'">
          <h3>${s.name}</h3>
          <p>${s.description || ''}</p>
        </div>`;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Error loading subjects.</p><p style="font-size:0.8rem;color:red;margin-top:10px;background:#fff3f3;padding:10px;border-radius:6px;text-align:left;"><strong>Error:</strong> ${err.message}<br><br><strong>Code:</strong> ${err.code || 'N/A'}</p></div>`;
    console.error('Firebase error:', err);
  }
}

loadSubjects();
