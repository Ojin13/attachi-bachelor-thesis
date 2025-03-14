rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
  	// Files look like: "users/<UID>/path/to/file.txt"
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      // Only allow uploads of any image file that's less than 10MB
      // Only allow upload/deletion to only owners of the content
      allow write: if (request.auth != null && request.auth.uid == userId && request.resource != null && request.resource.size < 10 * 1024 * 1024)
    }
  }
}
