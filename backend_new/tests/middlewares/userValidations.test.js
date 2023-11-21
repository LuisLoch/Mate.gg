const request = require('supertest');
const express = require('express');
const { body } = require('express-validator');
const { timeDifference, validateBirthDate, loginValidation, userCreateValidation, userUpdateGameValidation, userUpdateValidation } = require('../../middlewares/userValidations'); // Adjust the path accordingly
const validate = require('../../middlewares/handleValidation')

describe('timeDifference', () => {
  it('Deve calcular a diferença de tempo corretamente.', () => {
    const result1 = timeDifference('10:00 - 14:30');
    expect(result1).toBe(4);

    const result2 = timeDifference('22:45 - 02:30');
    expect(result2).toBe(3);

    const result3 = timeDifference('23:45 - 01:30');
    expect(result3).toBe(1);
  });

  it('Deve lidar com uma diferença de tempo onde a inicial é maior que a final.', () => {
    const result = timeDifference('18:30 - 02:30');
    expect(result).toBe(8);
  });
});

describe('validateBirthDate', () => {
  it('Deve retornar verdadeiro para uma data real.', () => {
    const result = validateBirthDate('2005-09-01');
    expect(result).toBe(true);
  });

  it('Deve retornar falso para uma data inválida.', () => {
    const result = validateBirthDate('2030-01-01');
    expect(result).toBe(false);
  });

  it('Deve retornar falso para uma data em um formato errado.', () => {
    const result = validateBirthDate('invalid-date-format');
    expect(result).toBe(false);
  });
});