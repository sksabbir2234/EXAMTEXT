import { db, collection, doc, getDoc, getDocs, query, where, orderBy } from './firebase-config.js';
import { getParam, formatTime, getExamUrl, shareFacebook, shareWhatsApp, copyToClipboard } from './utils.js';

const attemptId = getParam('attempt');
const container = document.getElementById('result-container');

if (!attemptId) {
  location.href = 'index.html';
}

async function loadResult() {
  try {
    const attemptSnap = await getDoc(doc(db, 'attempts', attemptId));
    if (!attemptSnap.exists()) {
      container.innerHTML = `<div class="empty-state"><p>Result not found.</p></div>`;
      return;
    }
    const attempt = attemptSnap.data();

    const [examSnap, qSnap] = await Promise.all([
      getDoc(doc(db, 'exams', attempt.examId)),
      getDocs(query(collection(db, 'exams', attempt.examId, 'questions'), orderBy('order')))
    ]);

    const examData = examSnap.exists() ? examSnap.data() : {};
    const questions = [];
    qSnap.forEach(d => questions.push({ id: d.id, ...d.data() }));

    let subjectName = '';
    if (examData.subjectId) {
      const subSnap = await getDoc(doc(db, 'subjects', examData.subjectId));
      if (subSnap.exists()) subjectName = subSnap.data().name;
    }

    const answerMap = {};
    attempt.answers.forEach(a => { answerMap[a.questionId] = a.selectedOptionIndex; });

    let html = `
      <div class="result-summary">
        <div class="score-big">${attempt.score}/${attempt.totalMarks}</div>
        <div class="score-label">${subjectName} - ${examData.title || ''}</div>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value green">${attempt.correctCount}</div>
            <div class="stat-label">Correct</div>
          </div>
          <div class="stat-item">
            <div class="stat-value red">${attempt.wrongCount}</div>
            <div class="stat-label">Wrong</div>
          </div>
          <div class="stat-item">
            <div class="stat-value blue">${formatTime(attempt.timeTakenSeconds)}</div>
            <div class="stat-label">Time</div>
          </div>
        </div>
        <div id="rank-section" style="margin-top:16px;"></div>
      </div>`;

    questions.forEach((q, i) => {
      const selected = answerMap[q.id];
      const isCorrect = selected === q.correctOptionIndex;
      html += `
        <div class="question-card">
          <span class="question-number">${i + 1}</span>
          <div class="question-text">${q.questionText}</div>
          <div class="options">`;
      q.options.forEach((opt, oi) => {
        let cls = 'option-label';
        if (oi === q.correctOptionIndex) cls += ' correct';
        else if (oi === selected && !isCorrect) cls += ' wrong';
        html += `<div class="${cls}"><span>${opt}</span></div>`;
      });
      html += `</div>`;
      if (q.explanation) {
        html += `<div class="explanation">${q.explanation}</div>`;
      }
      html += `</div>`;
    });

    const examUrl = getExamUrl(attempt.examId);
    html += `
      <div class="admin-section" style="text-align:center;">
        <h3>Share this exam</h3>
        <div class="share-buttons" style="justify-content:center;">
          <button class="share-btn facebook" onclick="window._shareFB()">Facebook</button>
          <button class="share-btn whatsapp" onclick="window._shareWA()">WhatsApp</button>
          <button class="share-btn copy" onclick="window._copyLink()">Copy Link</button>
        </div>
      </div>
      <div style="text-align:center;padding:20px 0;">
        <a href="index.html" class="btn btn-secondary">Take Another Exam</a>
      </div>`;

    container.innerHTML = html;

    window._shareFB = () => shareFacebook(examUrl, `Test your knowledge: ${examData.title}`);
    window._shareWA = () => shareWhatsApp(examUrl, `Test your knowledge: ${examData.title}`);
    window._copyLink = () => copyToClipboard(examUrl);

    loadLeaderboard(attempt.examId, attemptId);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Error loading result.</p><p style="font-size:0.8rem;color:red;margin-top:10px;background:#fff3f3;padding:10px;border-radius:6px;text-align:left;"><strong>Error:</strong> ${err.message}</p></div>`;
    console.error(err);
  }
}

async function loadLeaderboard(examId, currentAttemptId) {
  try {
    const q = query(
      collection(db, 'attempts'),
      where('examId', '==', examId),
      orderBy('score', 'desc'),
      orderBy('timeTakenSeconds', 'asc')
    );
    const snap = await getDocs(q);
    let rank = 0;
    let topHtml = '';
    let pos = 0;

    snap.forEach(d => {
      pos++;
      const a = d.data();
      const isCurrent = d.id === currentAttemptId;
      if (isCurrent) rank = pos;
      const highlight = isCurrent ? ' current' : '';
      topHtml += `
        <div class="leaderboard-item${highlight}">
          <span class="leaderboard-rank">#${pos}</span>
          <span class="leaderboard-name">${a.studentName}</span>
          <span class="leaderboard-score">${a.score}/${a.totalMarks}</span>
        </div>`;
    });

    const section = document.getElementById('rank-section');
    if (section) {
      section.innerHTML = (rank ? `<div class="rank-badge">You ranked #${rank} out of ${pos}</div>` : '') + `
        <div class="leaderboard">
          <h3>Leaderboard</h3>
          ${topHtml || '<p style="color:#888;">No other attempts yet.</p>'}
        </div>`;
    }
  } catch (err) {
    console.error('Leaderboard error:', err);
  }
}

loadResult();
