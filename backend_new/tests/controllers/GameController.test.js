const request = require('supertest');

const { getGameList, getGameUserInfo } = require('../../controllers/GameController');
const { ref, get, query, getDatabase } = require('firebase/database');

const db = require('../../config/db');

jest.mock("firebase/database", () => {
  return {
    getDatabase: jest.fn().mockReturnValue({}),
    ref: jest.fn().mockReturnValue({}),
    get: jest.fn(),
    query: jest.fn(),
    initializeApp: jest.fn().mockReturnValue({
      database: jest.fn().mockReturnValue({
        ref: jest.fn().mockReturnThis()
      })
    }),
  };
});

const games = [
  { key: 'eft', val: () => ({
    "background": "EscapeFromTarkov-background.png",
    "name": "Escape From Tarkov",
    "splashart": "EscapeFromTarkov-splashart.jpg",
    "userInfo": {
      "nickname": "String",
      "dailyOnlineTime": "String",
      "level": [
        null,
        1,
        2,
        3,
        4,
        5,
      ],
      "playtime": "Integer",
      "description": "String"
    }
  })},
  { key: 'lol', val: () => ({
    "background": "LeagueOfLegends-background.jpg",
    "name": "League of Legends",
    "splashart": "LeagueOfLegends-splashart.png",
    "userInfo": {
      "nickname": "String",
      "dailyOnlineTime": "String",
      "elo": {
        "bronze": "Bronze",
        "challenger": "Desafiante",
        "diamond": "Diamante",
        "emerald": "Esmeralda",
        "gold": "Ouro",
        "grandmaster": "Grão-mestre",
        "iron": "Ferro",
        "master": "Mestre",
        "platinum": "Platina",
        "silver": "Prata"
      },
      "3level": "Integer",
      "4mains": {
        "aatrox": "Aatrox",
        "ahri": "Ahri",
        "akali": "Akali",
        "akshan": "Akshan",
        "amumu": "Amumu"
      },
      "5description": "String"
    }
  })}
]

const lolUserInfo = {
  key: 'userInfo', val: () => ({
    "nickname": "String",
    "dailyOnlineTime": "String",
    "elo": {
      "bronze": "Bronze",
      "challenger": "Desafiante",
      "diamond": "Diamante",
      "emerald": "Esmeralda",
      "gold": "Ouro",
      "grandmaster": "Grão-mestre",
      "iron": "Ferro",
      "master": "Mestre",
      "platinum": "Platina",
      "silver": "Prata"
    }
  })
}


describe('Game Controller', () => {
  describe('getGameList', () => {
    it('Deve retornar a lista de jogos existente', async () => {
      jest.spyOn(require('firebase/database'), 'get').mockReturnValueOnce(games);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await getGameList(req, res);
  
      const gameRes = {};
      games.forEach(({ key, val }) => {
        gameRes[key] = val();
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(gameRes);
    });

    it('Deve lidar com o erro de nenhum jogo encontrado', async () => {
      jest.spyOn(require('firebase/database'), 'get').mockReturnValueOnce([]);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getGameList(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ errors: ['Nenhum jogo foi encontrado.'] });
    });

    it('Deve lidar com o erro ao realizar a busca por jogos', async () => {
      jest.spyOn(require('firebase/database'), 'get').mockImplementation(() => {
        throw new Error('Erro ao buscar jogos');
      });

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getGameList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ errors: ['Não foi possível realizar a busca por jogos.'] });
    });
  });

  describe('getGameUserInfo', () => {
    it('Deve retornar as informações do usuário do jogo existente', async () => {
      const queryMock = jest.fn();
      const getMock = jest.fn(() => lolUserInfo);

      jest.spyOn(require('firebase/database'), 'query').mockImplementation(queryMock);
      jest.spyOn(require('firebase/database'), 'get').mockImplementation(getMock);

      const req = { params: { gameId: 'lol' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getGameUserInfo(req, res);

      expect(queryMock).toHaveBeenCalledWith(ref(db, `games/${req.params.gameId}/userInfo`));
      expect(getMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(lolUserInfo.val());
    });

    it('Deve lidar com o erro de jogo não encontrado', async () => {
      // Mock do Firebase
      const userInfoSnapshot = { val: jest.fn() };
      jest.spyOn(require('firebase/database'), 'get').mockImplementation(() => userInfoSnapshot);

      const req = { params: { gameId: 'lol' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getGameUserInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ errors: ['Jogo não encontrado.'] });
    });

    it('Deve lidar com erro interno ao buscar o jogo informado', async () => {
      jest.spyOn(require('firebase/database'), 'get').mockImplementation(() => {
        throw new Error('Erro ao buscar jogo informado');
      });

      const req = { params: { gameId: 'lol' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getGameUserInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ errors: ['Não foi possível realizar a busca pelo jogo informado.'] });
    });
  });
});