# Firestore Security Rules

Copy-paste this into Firebase Console → Firestore Database → Rules, then click Publish.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /subjects/{subjectId} {
      allow read: if true;
      allow write: if true;
    }

    match /exams/{examId} {
      allow read: if true;
      allow write: if true;

      match /questions/{questionId} {
        allow read: if true;
        allow write: if true;
      }
    }

    match /attempts/{attemptId} {
      allow create: if true;
      allow read: if true;
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

## Notes

- This app uses the Firebase Admin SDK for the server-side exam uploads, while public data is meant to be readable from the browser.
- Private service-account keys must never be committed to a repository.
- Rotate any real Firebase service account credentials immediately if they were exposed in a previous commit.
