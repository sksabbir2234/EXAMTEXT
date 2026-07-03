const express = require('express');
const path = require('path');
const compression = require('compression');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
}
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============ API ROUTES ============

// Get all subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const snap = await db.collection('subjects').get();
    const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get exams by subject
app.get('/api/exams/:subjectId', async (req, res) => {
  try {
    const snap = await db.collection('exams')
      .where('subjectId', '==', req.params.subjectId)
      .where('published', '==', true)
      .get();
    const exams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get exam details (for OG tags)
app.get('/api/exam/:id', async (req, res) => {
  try {
    const snap = await db.collection('exams').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found' });
    const exam = { id: snap.id, ...snap.data() };

    // Get subject name
    let subjectName = '';
    try {
      const subSnap = await db.collection('subjects').doc(exam.subjectId).get();
      if (subSnap.exists) subjectName = subSnap.data().name;
    } catch {}
    exam.subjectName = subjectName;

    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get questions for an exam
app.get('/api/exam/:id/questions', async (req, res) => {
  try {
    const snap = await db.collection('exams').doc(req.params.id).collection('questions').orderBy('order').get();
    const questions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit attempt
app.post('/api/attempt', async (req, res) => {
  try {
    const { examId, studentName, score, total, answers, timeTaken } = req.body;
    const ref = await db.collection('attempts').add({
      examId,
      studentName,
      score,
      total,
      answers,
      timeTaken,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: ref.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leaderboard
app.get('/api/leaderboard/:examId', async (req, res) => {
  try {
    const snap = await db.collection('attempts')
      .where('examId', '==', req.params.examId)
      .orderBy('score', 'desc')
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get();
    const attempts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all data
app.get('/api/admin/all', async (req, res) => {
  try {
    const subSnap = await db.collection('subjects').get();
    const subjects = [];
    for (const subDoc of subSnap.docs) {
      const examSnap = await db.collection('exams').where('subjectId', '==', subDoc.id).get();
      const exams = examSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      subjects.push({ id: subDoc.id, ...subDoc.data(), exams });
    }
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Upload exam
app.post('/api/admin/upload', async (req, res) => {
  try {
    const data = req.body;
    const subjectSlug = slugify(data.subject || 'general');

    // Create/update subject
    await db.collection('subjects').doc(subjectSlug).set({
      name: data.subject || 'General',
      slug: subjectSlug,
      description: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Create exam
    const examRef = await db.collection('exams').add({
      subjectId: subjectSlug,
      title: data.examTitle || 'Untitled Exam',
      slug: slugify(data.examTitle || 'untitled'),
      durationMinutes: data.durationMinutes || 0,
      totalQuestions: data.questions.length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      published: true
    });

    // Add questions in batch
    const batch = db.batch();
    data.questions.forEach((q, i) => {
      const qRef = db.collection('exams').doc(examRef.id).collection('questions').doc();
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

    res.json({ id: examRef.id, message: 'Uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete exam
app.delete('/api/admin/exam/:id', async (req, res) => {
  try {
    const qSnap = await db.collection('exams').doc(req.params.id).collection('questions').get();
    const batch = db.batch();
    qSnap.forEach(d => batch.delete(d.ref));
    await batch.commit();
    await db.collection('exams').doc(req.params.id).delete();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete subject
app.delete('/api/admin/subject/:id', async (req, res) => {
  try {
    const examSnap = await db.collection('exams').where('subjectId', '==', req.params.id).get();
    for (const examDoc of examSnap.docs) {
      const qSnap = await db.collection('exams').doc(examDoc.id).collection('questions').get();
      const batch = db.batch();
      qSnap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      await db.collection('exams').doc(examDoc.id).delete();
    }
    await db.collection('subjects').doc(req.params.id).delete();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Toggle publish
app.put('/api/admin/exam/:id/publish', async (req, res) => {
  try {
    await db.collection('exams').doc(req.params.id).update({ published: req.body.published });
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function slugify(text) {
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

// ============ PAGE ROUTES (with dynamic OG tags) ============

app.get('/', (req, res) => res.render('index'));
app.get('/subject', (req, res) => res.render('subject'));
app.get('/admin', (req, res) => res.render('admin'));
app.get('/cse-exams', (req, res) => res.render('cse-exams'));

// Exam intro - needs dynamic OG tags
app.get('/exam-intro', async (req, res) => {
  const examId = req.query.id;
  let exam = { title: 'Exam Portal', totalQuestions: 0, subjectName: '', durationMinutes: 0 };
  try {
    const snap = await db.collection('exams').doc(examId).get();
    if (snap.exists) {
      exam = { id: snap.id, ...snap.data() };
      const subSnap = await db.collection('subjects').doc(exam.subjectId).get();
      if (subSnap.exists) exam.subjectName = subSnap.data().name;
    }
  } catch {}
  res.render('exam-intro', { exam, examId });
});

app.get('/exam', (req, res) => res.render('exam', { examId: req.query.id }));
app.get('/result', (req, res) => res.render('result', { attemptId: req.query.id, examId: req.query.examId }));

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
