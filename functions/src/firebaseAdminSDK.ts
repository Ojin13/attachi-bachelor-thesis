// Keep single instance of admin to boost performance
import * as admin from "firebase-admin";
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  projectId: "*****************",
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "*****************"
});

export const adminImport = admin;
