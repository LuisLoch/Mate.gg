const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { sendMessage, getMessages, setMessageNotification } = require('./firebase');
const cors = require('cors');

const app = express();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

corsOptions = {
  credentials: true,
  origin: 'http://localhost:3000',
};

app.use(cors(corsOptions));

//Connected users
const users = {};

app.get('/', (req, res) => {
  res.send('API Working!');
});

io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  //Caso um usuário se conecte e não possua login
  if(!users[socket.id]) {
    socket.emit('login-necessary');
  }

  //Join an user to the chat server
  socket.on('join', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('user-connected', username);
    console.log("Lista de usuários logados: ", users)
  });

  socket.on('notify', ({user, value}) => {
    setMessageNotification({user: user, value: value})
    const targetSocketId = Object.keys(users).find((key) => users[key] === user);
    if (targetSocketId) {
      console.log("Notificações atualizadas do usuário recebedor: ", targetSocketId);
      io.to(targetSocketId).emit('refresh');
    }
  })

  //Send the first message to another user
  socket.on('start-chat', ({targetUser, userPhoto, targetPhoto}) => {
    const user = users[socket.id];
    if(!user) {
      socket.emit('login-necessary');
      return;
    }

    if(user && targetUser && userPhoto && targetPhoto) {
      sendMessage({message: null, sender: user, receiver: targetUser, senderPhoto: userPhoto, receiverPhoto: targetPhoto});
    }

    //Refreshes the messages of the sender socket user
    socket.emit('refresh');
    console.log("Mensagens atualizadas do usuário atual: ", socket.id);

    //Refreshes the messages of the receiver socket user (if he is online)
    const targetSocketId = Object.keys(users).find((key) => users[key] === targetUser);
    if (targetSocketId) {
      console.log("Mensagens atualizadas do usuário recebedor: ", targetSocketId);
      io.to(targetSocketId).emit('refresh');
    }
  });

  //Send a message to another user
  socket.on('send-message', ({message, targetUser, userPhoto}) => {
    const user = users[socket.id];
    if(!user) {
      socket.emit('login-necessary');
      return;
    }

    if(message && user && targetUser && userPhoto) {
      console.log("Enviou uma mensagem.");
      sendMessage({message: message, sender: user, receiver: targetUser, senderPhoto: userPhoto});
    }

    //Refreshes the messages of the sender socket user
    socket.emit('refresh');
    console.log("Mensagens atualizadas do usuário atual: ", socket.id);

    //Refreshes the messages of the receiver socket user (if he is online)
    const targetSocketId = Object.keys(users).find((key) => users[key] === targetUser);
    if (targetSocketId) {
      console.log("Mensagens atualizadas do usuário recebedor: ", targetSocketId);
      io.to(targetSocketId).emit('refresh');
    }
  });

  //Get all user messages
  socket.on('get-messages', async () => {
    const username = users[socket.id];
    if (username) {
      try {
        const messages = await getMessages(username);
        socket.emit('messages', messages);
      } catch (error) {
        console.error('Erro ao obter mensagens: ', error);
      }
    } else {
      console.error('Nome de usuário não encontrado para buscar mensagens.');
    }
  });
  
  //Disconnect from the server
  socket.on('disconnect', () => {
    console.log("Usuário desconectado: ", users[socket.id]);
    const userId = users[socket.id];
    delete users[socket.id];
    socket.broadcast.emit('user-disconnected', userId);
  });
});

const port = 4000;

server.listen(port, () => {
  console.log(`Socket server initialized on port ${port}`);
});
