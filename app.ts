const express = require("express");
var cors = require('cors')
const { router } = require("./src/api");
const bodyParser = require("body-parser");
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';

require("dotenv").config();

const app = express();

// const { initializeApp, getAuth, GoogleAuthProvider } = require("firebase");

// const firebaseConfig = {
//   apiKey: "AIzaSyDyr8SzTJD6XaH3VHLSkJ4P86FTu-X5cMo",
//   authDomain: "docpost-mvp.firebaseapp.com",
//   projectId: "docpost-mvp",
//   storageBucket: "docpost-mvp.appspot.com",
//   messagingSenderId: "965621374225",
//   appId: "1:965621374225:web:c3f85b9df987f71478c0b0"
// };

// // Initialize Firebase

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'),
  databaseURL: "https://docpost-mvp-default-rtdb.firebaseio.com"
});

// export const auth = getAuth(FirebaseApp);
// export const googleProvider = new GoogleAuthProvider();

app.use(cors())
app.use(bodyParser.json());


if (!process.env.PORT) {
  throw new Error('port environment variable not defined, make sure to setup the environment first')
}

app.listen(process.env.PORT, () => {
  console.log("listening on port " + process.env.PORT);
});

app.get("/", async (_req: any, res: { send: (arg0: string) => void; }) => {
  res.send("Welcome to Gmail API with NodeJS");
});

app.use('/api', router)

export default admin;