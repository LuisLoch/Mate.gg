const admin = require('firebase-admin');

const serviceAccount = require('./firebase-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://mategg-c5508-default-rtdb.firebaseio.com/',
});

async function setMessageAndPhoto(ref, sender, messageId, message, photo) {
  if(message && messageId) {
    ref.child(messageId).set({
      sender,
      message,
    });
  }
  if(photo) {
    ref.child('photo').set(photo);
  }
}

async function sendMessage({ message, sender, receiver, senderPhoto, receiverPhoto }) {
  if (sender && receiver && senderPhoto) {
    const receiverMessagesRef = admin.database().ref(`users/${receiver}/messages/${sender}`);
    const senderMessagesRef = admin.database().ref(`users/${sender}/messages/${receiver}`);
    const messageId = Date.now().toString();
    
    setMessageAndPhoto(receiverMessagesRef, sender, messageId, message, senderPhoto);
    setMessageAndPhoto(senderMessagesRef, sender, messageId, message, receiverPhoto);

    setMessageNotification({user: receiver, value: true});
  } else {
    console.error('Valores ausentes. Não é possível iniciar o chat.');
  }
}

//Get all user messages
async function getMessages(user) {
  const messagesRef = admin.database().ref(`users/${user}/messages`);
  return messagesRef.orderByKey().once('value')
    .then((snapshot) => {
      const messages = {};
      snapshot.forEach((childSnapshot) => {
        const messageId = childSnapshot.key;
        const message = childSnapshot.val();
        messages[messageId] = message;
      });
      return messages;
    });
}

async function setMessageNotification({user, value}) {
  const notificationRef = admin.database().ref(`users/${user}/messages/notification`);
  notificationRef.set(value);
}

module.exports = { sendMessage, getMessages, setMessageNotification };