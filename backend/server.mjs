import express from "express";
import cors from "cors";
import User from "./models/User.js";

const app = express();

app.use(express.json());
app.use(cors());

// Rota para listar todos os usuários
app.get('/users', (req, res) => {
  User.getAllUsers((users) => {
    res.json(users);
  });
});

// Rota para obter um usuário por ID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;

  User.getUserById(id, (user) => {
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: '400' });
    }

    res.json(user);
  });
});

// Rota para criar um novo usuário
app.post('/users', (req, res) => {
  const { name, email, birth_date } = req.body;

  const user = {
    name,
    email,
    birth_date
  };

  User.createUser(user, (newUser) => {
    res.status(201).json(newUser);
  });
});

// Rota para atualizar um usuário por ID
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, birth_date, email } = req.body;

  const updatedData = {
    name,
    birth_date,
    email
  };

  User.updateUser(id, updatedData, (updatedUser) => {
    res.json(updatedUser);
  });
});

// Rota para deletar um usuário por ID
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  User.deleteUser(id, (deletedUser) => {
    res.json(deletedUser);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
