const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { sendMessage, getMessages, startChat } = require('./firebase');
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

  //Join an user to the chat server
  socket.on('join', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('user-connected', username);
    console.log("Lista de usuários logados: ", users)
  });

  //Send the first message to another user
  socket.on('start-chat', ({message, targetUser, userPhoto, targetPhoto}) => {
    const userName = users[socket.id];
    console.log("FOTOS: ", userPhoto, targetPhoto)
    console.log("Usuário: ", userName);
    console.log("Usuário alvo: ", targetUser);
    io.emit('message', `${userName}: ${message}`);
    

    startChat(userName, targetUser, message, userPhoto, targetPhoto);
  });

  //Send a message to another user
  socket.on('send-message', ({message, targetUser}) => {
    const userName = users[socket.id];
    console.log("Usuário: ", userName);
    console.log("Usuário alvo: ", targetUser);
    io.emit('message', `${userName}: ${message}`);

    sendMessage(userName, targetUser, message);
  });

  //Get all user messages
  socket.on('get-messages', async () => {
    const username = users[socket.id];
    if (username) {
      try {
        const messages = await getMessages(username);

        console.log(messages)
        
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
