'use strict';

const functions = require('firebase-functions');
const { PythonShell } = require('python-shell');

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
const client = new line.Client(config);

const pyshell = new PythonShell('calc.py');

exports.sendParams = functions
  .region('asia-northeast1')
  .firestore.document('users/{userId}')
  .onWrite((change, context) => {
    const userId = context.params.userId;

    getAnalyzed(userId).then((result) => {
      let pushContent = 'test';

      pushContent = result;

      const message = {
        type: 'text',
        text: pushContent,
      };

      client
        .pushMessage(userId, message)
        .then(() => {
          console.log('push OK.');
        })
        .catch((err) => {
          console.log(err);
        });
    });

    return 0;
  });

const getAnalyzed = (userId) => {
  return new Promise((resolve) => {
    console.log('reach getDoc');
    db.collection('users')
      .doc(userId)
      .get()
      .then((doc) => {
        console.log('staet analyze');
        const rawData = doc.data();
        pyshell.send(rawData.message);
        pyshell.on('message', (message) => {
          resolve(message);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
