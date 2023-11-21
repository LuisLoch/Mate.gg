const request = require('supertest');

const { register, login, getCurrentUser, getCurrentUserGames, updateUser, updateCurrentUserGame, getUserById, getPlayerList } = require('../../controllers/UserController');
const { ref, query, push, set, update, get, orderByChild, equalTo } = require("firebase/database");

const db = require('../../config/db');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock("firebase/database", () => {
  return {
    getDatabase: jest.fn().mockReturnValue({}),
    ref: jest.fn().mockReturnValue({}),
    get: jest.fn(),
    push: jest.fn(),
    query: jest.fn(),
    orderByChild: jest.fn(),
    equalTo: jest.fn(),
    update: jest.fn().mockReturnValue({}),
    initializeApp: jest.fn().mockReturnValue({
      database: jest.fn().mockReturnValue({
        ref: jest.fn().mockReturnThis(),
      })
    }),
  };
});

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const users = [
  { key: '-NjC5SVk7TjHBYun7WK2', val: () => ({
    "birth_date": "2002-09-30",
    "email": "test@example.com",
    "password": "$2a$10$5Kw9bjBk4MbwU41Rz.hc2OIrwwq4PhBlQxTzUnC10pEiZSUVYw17.",
    "games": {
      "dayz": {
        "dailyOnlineTime": "15:15 - 18:30",
        "description": "Jogo dayz desde 2019, tenho base em Svergino",
        "nickname": "ZacZoubar",
        "playtime": 1595,
        "updateMoment": "2023-11-15 05:37"
      }
    },
    "photo": "1700026579218.png",
    "region": "Sul",
  })},
  { key: '-NjC5STk7TjHBCun5WX9', val: () => ({
    "birth_date": "2007-07-14",
    "email": "test2@example.com",
    "password": "$4b$11$5Kw9bjTk4MbwU41Rz.hc2PIrwaw5GhBlQxTzUnC10pEiZSUGYw22.",
    "games": {
      "dayz": {
        "dailyOnlineTime": "11:00 - 14:45",
        "description": "Gosto de jogar dayz, mas não tenho muito tempo por dia. Sou novato.",
        "nickname": "PooPerMan",
        "playtime": 115,
        "updateMoment": "2023-11-15 05:37"
      }
    },
    "photo": "1700026571222.png",
    "region": "Sudeste",
  })},
]

describe('User Controller', () => {
  describe('register', () => {
    it('Deve registrar um novo usuário', async () => {
      const pushMock = jest.fn().mockReturnValue({
        message: 'Usuário criado com sucesso.',
        _id: 'newUserId',
        token: 'fakeToken',
      });
      jest.spyOn(require('firebase/database'), 'push').mockImplementation(pushMock);
      
      const emailSnapshotMock = {
        exists: jest.fn().mockReturnValue(false),
      };
      jest.spyOn(require('firebase/database'), 'get').mockImplementation(() => emailSnapshotMock);

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');

      jwt.sign.mockReturnValue('fakeToken');

      const req = {
        body: { email: 'test@example.com', password: 'password' },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await register(req, res);
      expect(pushMock).toHaveBeenCalled();
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 'salt');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário criado com sucesso.',
        _id: undefined,
        token: 'fakeToken',
      });
    });

    it('Deve lidar com um erro interno do servidor ao realizar um cadastro de usuário.', async () => {
      jest.spyOn(require('firebase/database'), 'push').mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = {
        body: { email: 'test@example.com', password: 'password' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ errors: ['Erro interno.'] });
    });

    it('Deve lidar com uma tentativa de cadastro de um usuário com um e-mail que já existe.', async () => {
      const existingEmail = 'existingemail@example.com';

      const emailSnapshotMock = {
        exists: jest.fn().mockReturnValue({
          'NjC5SVk7TjHBYun7WK2': {
            'email': existingEmail
          }
        }),
      };
      jest.spyOn(require('firebase/database'), 'get').mockImplementation(() => emailSnapshotMock);

      const req = {
        body: { email: existingEmail, password: 'password' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ errors: ['O email informado já está sendo usado.'] });
    });
  });

  describe('login', () => {
    it('Deve realizar o login de um usuário por meio de um e-mail e uma senha.', async () => {
      const email = 'test@example.com';
      const password = '123456';
      const mockSnapshot = {
        exists: jest.fn().mockReturnValue(true),
        val: jest.fn().mockReturnValue({
          '-NjC5SVk7TjHBYun7WK2': {
            email: 'test@example.com',
            password: '$2a$10$5Kw9bjBk4MbwU41Rz.hc2OIrwwq4PhBlQxTzUnC10pEiZSUVYw17.',
            photo: 'userPhoto.jpg',
          },
        }),
      };
  
      jest.spyOn(require('firebase/database'), 'get').mockResolvedValue(mockSnapshot);
  
      bcrypt.compare.mockResolvedValue(true);
  
      jwt.sign.mockReturnValue('fakeToken');
  
      const req = {
        body: { email, password },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await login(req, res);

      expect(mockSnapshot.exists).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, '$2a$10$5Kw9bjBk4MbwU41Rz.hc2OIrwwq4PhBlQxTzUnC10pEiZSUVYw17.');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: '-NjC5SVk7TjHBYun7WK2',
        photo: 'userPhoto.jpg',
        token: 'fakeToken',
      });
    });

    it('Deve lidar com uma senha de usuário incorreta', async () => {
      const email = 'test@example.com';
      const password = '123456';
      const mockSnapshot = {
        exists: jest.fn().mockReturnValue(true),
        val: jest.fn().mockReturnValue({
          '-NjC5SVk7TjHBYun7WK2': {
            email: 'test@example.com',
            password: '$2a$10$5Kw9bjBk4MbwU41Rz.hc2OIrwwq4PhBlQxTzUnC10pEiZSUVYw17.',
            photo: 'userPhoto.jpg',
          },
        }),
      };
  
      jest.spyOn(require('firebase/database'), 'get').mockResolvedValue(mockSnapshot);
  
      bcrypt.compare.mockResolvedValue(false);
  
      const req = {
        body: { email, password },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await login(req, res);

      expect(mockSnapshot.exists).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, '$2a$10$5Kw9bjBk4MbwU41Rz.hc2OIrwwq4PhBlQxTzUnC10pEiZSUVYw17.');
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        errors: ["Senha inválida."]
      });
    });

    it('Deve lidar com um e-mail de usuário inexistente.', async () => {
      const email = 'test@example.com';
      const password = '123456';
      const mockSnapshot = {
        exists: jest.fn().mockReturnValue(false),
        val: jest.fn().mockReturnValue({
          '-NjC5SVk7TjHBYun7WK2': {
            email: 'test@example.com',
            password: '$2a$10$5Kw9bjBk4MbwU41Rz.hc2OIrwwq4PhBlQxTzUnC10pEiZSUVYw17.', // Hashed password
            photo: 'userPhoto.jpg',
          },
        }),
      };
  
      jest.spyOn(require('firebase/database'), 'get').mockResolvedValue(mockSnapshot);
  
      const req = {
        body: { email, password },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await login(req, res);

      expect(mockSnapshot.exists).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        errors: ["Usuário não encontrado."]
      });
    });
  });
  

  describe('getCurrentUser', () => {
    it('Deve retornar o usuário atual, que é passado por meio da requisição.', async () => {
      const req = {
        user: users[0].val()
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getCurrentUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users[0].val());
    });
  });

  describe('getCurrentUserGames', () => {
    it('Deve retornar os jogos do usuário, caso tenha algum.', async () => {
      const userWithGames = users[0].val();
  
      const req = { user: userWithGames };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await getCurrentUserGames(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(userWithGames.games);
    });
  
    it('Deve retornar uma lista vazia de jogos de um usuário que não possui jogos.', async () => {
      const userWithoutGames = { user: { id: 'userId' } };
  
      const req = { user: userWithoutGames };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await getCurrentUserGames(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('updateUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('Deve atualizar um usuário com uma nova senha, foto, data de nascimento, região e jogos.', async () => {
      const req = {
        body: {
          password: 'newPassword',
          birth_date: '1990-01-01',
          games: {
            'Game1': {
              level: 11,
              playtime: 1500,
              dailyOnlineTime: '11:15 - 15:30',
              description: 'description'
            },
          },
          region: 'Region1',
        },
        file: { filename: 'photo.jpg' },
        user: {
          id: 'userId',
        },
      };
    
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    
      const userSnapshotMock = {
        val: jest.fn().mockReturnValue({
          id: 'userId',
          password: 'oldPassword',
        }),
      };
  
      jest.spyOn(require('firebase/database'), 'get').mockResolvedValue(userSnapshotMock);
  
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
  
      await updateUser(req, res);
  
      expect(get).toHaveBeenCalledWith(ref(expect.anything(), 'users/userId'));
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 'salt');
      expect(update).toHaveBeenCalledWith(
        ref(expect.anything(), 'users/userId'),
        expect.objectContaining({
          password: 'hashedPassword',
          photo: 'photo.jpg',
          birth_date: '1990-01-01',
          games: {
            'Game1': {
              level: 11,
              playtime: 1500,
              dailyOnlineTime: '11:15 - 15:30',
              description: 'description'
            },
          },
          region: 'Region1',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'userId' }));
    });

    it('Deve lidar com um erro do banco de dados ao tentar atualizar o usuário', async () => {
      const req = {
        body: {
          password: 'newPassword',
          birth_date: '1990-01-01',
          games: {
            'Game1': {
              level: 11,
              playtime: 1500,
              dailyOnlineTime: '11:15 - 15:30',
              description: 'description'
            },
          },
          region: 'Region1',
        },
        file: { filename: 'photo.jpg' },
        user: {
          id: 'userId',
        },
      };
    
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const userSnapshotMock = {
        val: jest.fn().mockReturnValue({
          id: 'userId',
          password: 'oldPassword',
        }),
      };
  
      jest.spyOn(require('firebase/database'), 'get').mockResolvedValue(userSnapshotMock);
  
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
  
      jest.spyOn(require('firebase/database'), 'update').mockRejectedValue(new Error('Database update error'));

      await updateUser(req, res);
  
      expect(get).toHaveBeenCalledWith(ref(expect.anything(), 'users/userId'));
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 'salt');
      expect(update).toHaveBeenCalledWith(
        ref(expect.anything(), 'users/userId'),
        expect.objectContaining({
          password: 'hashedPassword',
          photo: 'photo.jpg',
          birth_date: '1990-01-01',
          games: {
            'Game1': {
              level: 11,
              playtime: 1500,
              dailyOnlineTime: '11:15 - 15:30',
              description: 'description'
            },
          },
          region: 'Region1',
        })
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        errors: ['Erro ao atualizar os dados do usuário.'],
      });
    });

    it('should return 404 when the user is not found', async () => {
      const req = {
        body: {
          password: 'newPassword',
          birth_date: '1990-01-01',
          games: {
            'Game1': {
              level: 11,
              playtime: 1500,
              dailyOnlineTime: '11:15 - 15:30',
              description: 'description',
            },
          },
          region: 'Region1',
        },
        file: { filename: 'photo.jpg' },
        user: {
          id: 'unexistentUserId',
        },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const userSnapshot = {
        val: jest.fn().mockReturnValue(null),
      };
  
      jest.spyOn(require('firebase/database'), 'get').mockResolvedValue(userSnapshot);
  
      await updateUser(req, res);
  
      expect(get).toHaveBeenCalledWith(ref(expect.anything(), 'users/unexistentUserId'));
      expect(update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ errors: ['Usuário não encontrado.'] });
    });
  });
  

  describe('getUserById', () => {
    it('Deve retornar um usuário por meio do id informado', async () => {
      const req = {
        params: {
          id: 'validUserId',
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
    
      const userData = {
        id: 'validUserId',
        email: 'test@example.com',
        password: 'XCPONaSNCANSCasodijnasoidjcxnoAINA78sha9*&Ha87WAd*',
        photo: 'userPhoto.png',
        region: 'Nordeste'
      };
    
      const userSnapshotMock = {
        val: jest.fn().mockReturnValue(userData),
      };
    
      const userRefMock = {
        update: jest.fn(),
      };
    
      jest.spyOn(require('firebase/database'), 'ref').mockReturnValue(userRefMock);
      jest.spyOn(require('firebase/database'), 'get').mockResolvedValue(userSnapshotMock);
    
      await getUserById(req, res);
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(userData);
    });
    
    it('Deve lidar com um erro para quando o id informado não corresponde a nenhum usuário', async () => {
      const req = {
        params: {
          id: 'invalidUserId',
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
  
      jest.spyOn(require('firebase/database'), 'get').mockRejectedValue({ val: null });
  
      await getUserById(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ errors: ['Usuário não encontrado.'] });
    });
  
    it('Deve lidar com um erro interno do servidor ao procurar um usuário.', async () => {
      const req = {
        params: {
          id: 'validUserId',
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
  
      jest.spyOn(require('firebase/database'), 'get').mockRejectedValue(new Error('Database error'));
  
      await getUserById(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ errors: ['Usuário não encontrado.'] });
    });
  });

  describe('getPlayerList', () => {
    it('Deve retornar a lista de jogadores de um jogo específico', async () => {
      jest.spyOn(require('firebase/database'), 'get').mockReturnValueOnce(users);

      const gameId = 'dayz';

      const req = { params: { gameId: gameId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await getPlayerList(req, res);
  
      const usersRes = {};

      users.forEach((user) => {
        const playerData = user.val();
        const playerKey = user.key;
        if (playerData && playerData.games && playerData.games[gameId]) {
          const player = playerData.games[gameId];
          player.region = playerData.region;
          player.birth_date = playerData.birth_date;
          player.photo = playerData.photo;
          player.id = playerKey;
          usersRes[playerData.games[gameId]['nickname']] = player;
        }
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(usersRes);
    });

    it('Deve lidar com erro interno ao buscar a lista de jogadores', async () => {
      jest.spyOn(require('firebase/database'), 'get').mockImplementation(() => {
        throw new Error('Erro ao buscar jogo informado');
      });
      
      const gameId = 'dayz';

      const req = { params: { gameId: gameId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await getPlayerList(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ errors: ["Não foi possível realizar a busca por jogadores."] });
    })
  });
});