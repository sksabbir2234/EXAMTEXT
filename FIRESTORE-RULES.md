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

-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDD0L2ldt4nS+EK
MY2bWj/CqjM+MDr1WeKsDUx6KM0U1qwpmX1kpqdWC+opqrldl1Nv4vsVtn1OOlaN
FdiK8oMzWeRDEUtvM09EVKGfSzdI7G3j+vvhnH1C8MxRE/zEZEV3pW+oO5HJJ9da
VBrWRcmI6qwDIaOsjHw+NbCzKGHhQWybo7Mr1qpIb3PaL33m+DtUDjQrmhYTw1n4
bXkp3oMrYLCyjgss2oOXNfBZ/D3pvat6yYsGreeVj+Pyt1VMiyqH9wvlKBWB5xuR
2mmKn4Lta/eVvHXT3VKqvpB0gDT6lqkrXxADQCrYDqAoclM+q3XqMU+k+Rq+qemz
BRG4AiMtAgMBAAECggEASO9mvAte6r8iFrRnXM6MQjs38/lt9HYi7lfTvQqWfKUL
IkGICaXjXTL56MQs4BXd36ZpRGihGrKzC0DwU6zJvqZEVdDKyqQPadGmE5mmAXUC
53BUQnAR3g2n5KkvtIzurQaDZOOvRQAggAYkqtv6mZNjN5VfjAUVv+wqoUiw0H/x
VU1qr0cZChcUfBpMzd/S4z214EXm7blYL5xsbxZlGxc+sIbRiJMxIzACFFSi0vMw
1zG2MsYWX7Y8v9vlHbRw0lDGaDnjK4ktnks+PFcF47RDdyI7svXyv6oQZbOJx1IH
FHV/wS7L2hmhdWACLB9ZVvSPhDebCEhKedOwh+tptwKBgQDt8uKc9V3BgtwGLvZu
Q1tGoOtIPhr/pWd17EuTh0D7+7O9gcH3l5PFgsSe680HhG2rgQDPbg8IDkZ31fPM
nW3E4bf2BGk6yuXBhz3O54oM+WkHDnlmECewANgaEqjwQKxQMOdbVGXPPBXJxFj0
rQ5VwgpjDmtIF981T8o5a1zzuwKBgQDSq5lTCCLxDgVV1v0V0yU5lw+XoDUaWMXz
IOrFJT3YYly60DbiOHYh4M/rz2zxvWPNVsubgVX4HjamhTMxPsY9/ohc8e0FPzM3
mKMnLn0ZV7/PAxarrqecmHjqsv4CO6k08bcSsG5GhTmrVduSkutRuiGErVdy6gsd
Z/aQTDnyNwKBgQCdyB3uWGGIDL7bNs7fxLhEuDXr3IrIlCRrtHlU5S35KSlBc0Zs
aE1rfc/lVZTJ9E1ImS0xXtiGzfh6RBv6xTVhhQ8YCkrA2oPJdWVNyojnG4dCT52+
SN4YPicN+uudDDV2o0b2b5tm9H+6IAGglRRZV2bN0mTfFD1FO5hrxL6JOwKBgCdx
NT2UcmZLR7hwjeW+KGQF4kdzGT4bjMQeT5YliNSwZcgcH4pvI77oBkWSCkWgPcU+
ENTGfD/9+CFpItJ/fEIzG3i7WrL2yDIKg9FcJNPP1/t8CoyOIJdy/ICEjoYAgYeG
Ec6P9bWCT+/CHV/t3dzpSkk64vqC0x3oTwNpIhg1AoGAMbZiiVWTcY3ef4iY6p5t
nrHA+LNsAzcwPrNor4Mu+Z1PWoxPug6bL2Uo5HVlQ3ZFZJoLvGzPMqG4DYt6QBsO
g/r6q8VJawm4oPm4jQ4oBG2MAPVDqhoBmpEsIFeEmBCyhx00bBL1gnnvOc2wIyxo
mvVOYb3TnhLE01zUiU76A7U=
-----END PRIVATE KEY-----