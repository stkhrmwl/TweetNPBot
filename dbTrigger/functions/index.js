'use strict';

const functions = require('firebase-functions');

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

exports.sendParams = functions
  .region('asia-northeast1')
  .firestore.document('users/{userId}')
  .onWrite((change, context) => {
    const userId = context.params.userId;

    getDoc(userId).then((result) => {
      let pushContent = result.message;
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

const getDoc = (userId) => {
  return new Promise((resolve) => {
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
