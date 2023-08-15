import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/User.js";
import Game from "./models/Game.js";
import Chat from "./models/Chat.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

//Usuários ------------------------------------------------------------------------------------------------------------------------------------------------------

//Requisição do tipo GET - listar todos os usuários
app.get('/users', (req, res) => {
  User.getAllUsers((status, users) => {
    res.status(status).json(users);
  });
});

//Requisição do tipo GET - listar um usuário
app.get('/users/:id', (req, res) => {
  const { id } = req.params;

  User.getUserById(id, (status, user) => {
    res.status(status).json(user);
  });
});

//Requisição do tipo POST - criar um usuário
app.post('/users', (req, res) => {
  const { name, email, birth_date } = req.body;

  const user = {
    name,
    email,
    birth_date
  };

  User.createUser(user, (status, message) => {
    res.status(status).json(message);
  });
});

//Requisição do tipo PUT - editar as informações de um usuário
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, birth_date, email } = req.body;

  const updatedData = {
    name,
    birth_date,
    email
  };

  User.updateUser(id, updatedData, (status, message) => {
    res.status(status).json(message);
  });
});

//Requisição do tipo DELETE - excluir um usuário
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  User.deleteUser(id, (status, message) => {
    res.status(status).json(message);
  });
});

//Jogos-----------------------------------------------------------------------------------------------------------------------------------------------------------

//Requisição do tipo GET - listar todos os jogos
app.get('/games', (req, res) => {
  Game.getAllGames((games) => {
    res.json(games);
  });
});

//Requisição do tipo GET - listar um jogo
app.get('/games/:id', (req, res) => {
  const { id } = req.params;

  Game.getGameById(id, (status, game) => {
    res.status(status).json(game);
  });
});

//Requisição do tipo POST - criar um jogo
app.post('/games', (req, res) => {
  const { title, description, art, userDetails } = req.body;

  const game = {
    title,
    description,
    art,
    userDetails
  };

  Game.createGame(game, (status, message) => {
    res.status(status).json(message);
  });
});

//Requisição do tipo PUT - editar as informações de um jogo
app.put('/games/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, art, userDetails } = req.body;

  const updatedData = {
    title,
    description,
    art,
    userDetails
  };

  Game.updateGame(id, updatedData, (status, message) => {
    res.status(status).json(message);
  });
});

//Requisição do tipo DELETE - excluir um jogo
app.delete('/games/:id', (req, res) => {
  const { id } = req.params;

  Game.deleteGame(id, (status, message) => {
    res.status(status).json(message);
  });
});

//Notificações-----------------------------------------------------------------------------------------------------------------------------------------------------

//Requisição do tipo GET - listar notificações de um usuário
app.get('/notifications/:userId', (req, res) => {
  const { userId } = req.params;

  Notification.getAllNotifications(userId, (status, notifications) => {
    res.status(status).json(notifications);
  });
});

//Requisição do tipo POST - criar um jogo
app.post('/notifications/:userId', (req, res) => {
  const { userId } = req.params;
  const { title, description } = req.body;

  const notification = {
    title,
    description,
  };

  Notification.createNotification(userId, notification, (status, message) => {
    res.status(status).json(message);
  });
});

//Requisição do tipo DELETE - excluir notificações
app.delete('/notifications/:id', (req, res) => {
  const { userId } = req.params;

  Notification.deleteGame(userId, (status, message) => {
    res.status(status).json(message);
  });
});

//Chats-----------------------------------------------------------------------------------------------------------------------------------------------------

//Requisição do tipo GET - listar as mensagens de um chat
app.get('/chats/:id', (req, res) => {
  const { id } = req.params;

  Chat.getChatById(id, (status, chat) => {
    res.status(status).json(chat);
  });
});

//Requisição do tipo POST - criar ou iniciar um novo chat
app.post('/chats', (req, res) => {
  const { usersIds, messages } = req.body;

  const chat = {
    usersIds,
    messages
  };

  Chat.createChat(chat, (status, message) => {
    res.status(status).json(message);
  });
});

//Requisição do tipo PUT - editar as informações de um chat (adicionar uma mensagem)
app.put('/chats/:id', (req, res) => {
  const { id } = req.params;
  const { newMessage } = req.body;

  const updatedData = {
    newMessage
  };

  Chat.updateChat(id, updatedData, (status, message) => {
    res.status(status).json(message);
  });
});

//Requisição do tipo DELETE - excluir um chat
app.delete('/chats/:id', (req, res) => {
  const { id } = req.params;

  Chat.deleteChat(id, (status, message) => {
    res.status(status).json(message);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
