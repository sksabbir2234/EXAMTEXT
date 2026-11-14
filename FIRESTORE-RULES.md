# Firestore Security Rules

Copy-paste this into **Firebase Console → Firestore Database → Rules**, then click **Publish**.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // All client access denied. The app interacts with Firestore exclusively
    // through the Firebase Admin SDK on the server, which bypasses security rules.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Notes

- This application interacts with Firestore exclusively via the Firebase Admin SDK running inside server-side endpoints on Vercel.
- The Firebase Admin SDK uses service account credentials that automatically bypass Firestore security rules.
- Public client reads and writes are strictly denied so that anyone with the project ID cannot inspect, tamper with, or delete data (subjects, exams, questions, and student attempts).
- Private service account keys must never be committed to the repository or included in client code.
- If a service account private key was ever exposed in previous commits or public repositories, rotate/revoke it immediately in the Google Cloud / Firebase Console.
