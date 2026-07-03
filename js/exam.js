import { db, collection, doc, getDoc, getDocs, query, orderBy, addDoc, serverTimestamp } from './firebase-config.js';
import { getParam, formatCountdown } from './utils.js';

const examId = getParam('id');
const studentName = sessionStorage.getItem('studentName');
const container = document.getElementById('exam-container');
const timerBar = document.getElementById('timer-bar');
const timerDisplay = document.getElementById('timer-display');

if (!examId || !studentName) {
  location.href = examId ? `exam-intro.html?id=${examId}` : 'index.html';
}

let examData = null;
let questions = [];
let answers = {};
let timerInterval = null;
let remainingSeconds = 0;
let startTime = null;

async function loadExam() {
  try {
    const examSnap = await getDoc(doc(db, 'exams', examId));
    if (!examSnap.exists()) {
      container.innerHTML = `<div class="empty-state"><p>Exam not found.</p></div>`;
      return;
    }
    examData = examSnap.data();
    document.title = examData.title + ' - Exam Portal';

    const q = query(collection(db, 'exams', examId, 'questions'), orderBy('order'));
    const qSnap = await getDocs(q);
    if (qSnap.empty) {
      container.innerHTML = `<div class="empty-state"><p>No questions found.</p></div>`;
      return;
    }

    qSnap.forEach(d => {
      questions.push({ id: d.id, ...d.data() });
    });

    renderExam();

    if (examData.durationMinutes > 0) {
      remainingSeconds = examData.durationMinutes * 60;
      timerBar.style.display = 'block';
      startTimer();
    }

    startTime = Date.now();
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Error loading exam.</p><p style="font-size:0.75rem;color:red;">${err.message}</p></div>`;
    console.error(err);
  }
}

function startTimer() {
  timerDisplay.textContent = formatCountdown(remainingSeconds);
  timerInterval = setInterval(() => {
    remainingSeconds--;
    timerDisplay.textContent = formatCountdown(remainingSeconds);
    if (remainingSeconds <= 60) {
      timerBar.classList.add('warning');
    }
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      submitExam();
    }
  }, 1000);
}

function renderExam() {
  let html = `<h2 style="margin-bottom:16px;">${examData.title}</h2>`;
  html += `<p style="margin-bottom:20px;color:#666;">${studentName}'s attempt</p>`;

  questions.forEach((q, i) => {
    html += `
      <div class="question-card">
        <span class="question-number">${i + 1}</span>
        <div class="question-text">${q.questionText}</div>
        <div class="options">`;
    q.options.forEach((opt, oi) => {
      html += `
          <label class="option-label" data-qid="${q.id}" data-oi="${oi}">
            <input type="radio" name="q_${q.id}" value="${oi}">
            ${opt}
          </label>`;
    });
    html += `</div></div>`;
  });

  html += `
    <div style="padding:20px 0;">
      <button class="btn btn-success btn-block" id="submit-btn">Submit Exam</button>
    </div>`;

  container.innerHTML = html;

  document.querySelectorAll('.option-label').forEach(label => {
    label.addEventListener('click', () => {
      const qid = label.dataset.qid;
      const oi = parseInt(label.dataset.oi);
      answers[qid] = oi;
      document.querySelectorAll(`[data-qid="${qid}"]`).forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
    });
  });

  document.getElementById('submit-btn').addEventListener('click', submitExam);
}

async function submitExam() {
  if (timerInterval) clearInterval(timerInterval);
  document.getElementById('submit-btn').disabled = true;
  document.getElementById('submit-btn').textContent = 'Submitting...';

  const timeTaken = Math.round((Date.now() - startTime) / 1000);
  let score = 0;
  let totalMarks = 0;
  let correctCount = 0;
  const answerArr = [];

  questions.forEach(q => {
    const selected = answers[q.id] !== undefined ? answers[q.id] : -1;
    const correct = selected === q.correctOptionIndex;
    if (correct) {
      score += (q.marks || 1);
      correctCount++;
    }
    totalMarks += (q.marks || 1);
    answerArr.push({ questionId: q.id, selectedOptionIndex: selected });
  });

  const wrongCount = questions.length - correctCount;

  try {
    const docRef = await addDoc(collection(db, 'attempts'), {
      examId,
      studentName,
      answers: answerArr,
      score,
      totalMarks,
      correctCount,
      wrongCount,
      submittedAt: serverTimestamp(),
      timeTakenSeconds: timeTaken
    });
    location.href = `result.html?attempt=${docRef.id}`;
  } catch (err) {
    console.error(err);
    alert('Error submitting. Please try again.');
    document.getElementById('submit-btn').disabled = false;
    document.getElementById('submit-btn').textContent = 'Submit Exam';
  }
}

loadExam();
