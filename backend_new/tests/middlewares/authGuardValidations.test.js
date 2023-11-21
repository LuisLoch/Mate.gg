require("dotenv").config();

const request = require('supertest');

const express = require('express');
const authGuard = require('../../middlewares/authGuard');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

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

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('authGuard middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer validToken',
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass if a valid token is provided', async () => {
    const verifiedUser = { id: 'someUserId' };
    jwt.verify.mockReturnValue(verifiedUser);

    jest.spyOn(require('firebase/database'), 'ref').mockResolvedValue({ val: () => ({}) });
    jest.spyOn(require('firebase/database'), 'get').mockResolvedValue({ val: () => ({}) });

    await authGuard(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
    expect(req.user).toEqual(expect.objectContaining(verifiedUser));
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', async () => {
    req.headers.authorization = undefined;

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ errors: ['Acesso negado'] });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ errors: ['Token inválido.'] });
    expect(next).not.toHaveBeenCalled();
  });
});