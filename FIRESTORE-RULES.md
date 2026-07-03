# Firestore Security Rules

Copy-paste this into **Firebase Console → Firestore Database → Rules**, then click **Publish**.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Subjects - full access
    match /subjects/{subjectId} {
      allow read: if true;
      allow write: if true;
    }

    // Exams - full access
    match /exams/{examId} {
      allow read: if true;
      allow write: if true;

      // Questions subcollection - full access
      match /questions/{questionId} {
        allow read: if true;
        allow write: if true;
      }
    }

    // Attempts - students can create, public can read
    match /attempts/{attemptId} {
      allow create: if true;
      allow read: if true;
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

## What this allows

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| subjects | ✓ | ✓ | ✓ | ✓ |
| exams | ✓ | ✓ | ✓ | ✓ |
| exams/{id}/questions | ✓ | ✓ | ✓ | ✓ |
| attempts | ✓ | ✓ | ✗ | ✗ |
