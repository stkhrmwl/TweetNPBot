'use strict';

const functions = require('firebase-functions');
const { PythonShell } = require('python-shell');
const pyshell = new PythonShell('./python_code/calc.py');

const twitter = require('twitter');
const line = require('@line/bot-sdk');
const ENV = require('./env.json');

// ******************** Firestore
const admin = require('firebase-admin');
const SERVICE_ACCOUNT = require('./service_account.json');
admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT),
});
const db = admin.firestore();
// ********************

const config = {
  channelAccessToken: ENV.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: ENV.LINE_CHANNEL_SECRET,
};
const liClient = new line.Client(config);

exports.sendParams = functions
  .region('asia-northeast1')
  .firestore.document('users/{userId}')
  .onWrite((change, context) => {
    const userId = context.params.userId;

    getDocument(userId).then((doc) => {
      // let pushContent = doc.message;

      getAnalyzed(doc.message).then((result) => {
        const message = {
          type: 'text',
          text: result,
        };

        liClient
          .pushMessage(userId, message)
          .then(() => {
            console.log('push OK.');
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });

    return 0;
  });

const getDocument = (userId) => {
  return new Promise((resolve) => {
    console.log('reach getDocument');
    db.collection('users')
      .doc(userId)
      .get()
      .then((doc) => {
        resolve(doc.data());
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const getAnalyzed = (keyword) => {
  return new Promise((resolve) => {
    console.log('reach getAnalyzed');
    let enc = escape(keyword).replace(/%/g, '\\');
    console.log(enc);
    pyshell.send(enc);
    pyshell.on('message', (message) => {
      resolve(message);
    });
  });
};
