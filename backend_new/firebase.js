const admin = require('firebase-admin');

const serviceAccount = require('./firebase-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://mategg-c5508-default-rtdb.firebaseio.com/',
});

//Send the first message message from an user to another
async function startChat(userSend, userReceive, message, userPhoto, targetPhoto) {
  console.log("FOTOS: ", userPhoto, targetPhoto)
  const timestamp = Date.now();
  const messageId = timestamp.toString();
  const messagesRefReceiver = admin.database().ref(`users/${userReceive}/messages/${userSend}/${messageId}`);
  messagesRefReceiver.set({
    sender: userSend,
    message: message,
  });
  const messagesRefReceiverPhoto = admin.database().ref(`users/${userReceive}/messages/${userSend}/photo`);
  messagesRefReceiverPhoto.set({targetPhoto})

  const messagesRefSender = admin.database().ref(`users/${userSend}/messages/${userReceive}/${messageId}`);
  messagesRefSender.set({
    sender: userSend,
    message: message,
  });
  const messagesRefSenderPhoto = admin.database().ref(`users/${userSend}/messages/${userReceive}/photo`);
  messagesRefSenderPhoto.set({userPhoto});
}

//Send a message from an user to another
async function sendMessage(userSend, userReceive, message) {
  const timestamp = Date.now();
  const messageId = timestamp.toString();
  const messagesRefReceiver = admin.database().ref(`users/${userReceive}/messages/${userSend}/${messageId}`);
  messagesRefReceiver.set({
    sender: userSend,
    message: message,
  });

  const messagesRefSender = admin.database().ref(`users/${userSend}/messages/${userReceive}/${messageId}`);
  messagesRefSender.set({
    sender: userSend,
    message: message,
  });
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

module.exports = { sendMessage, getMessages, startChat };