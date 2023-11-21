const {body} = require("express-validator");

function timeDifference(times) {
  const [start, end] = times.split(" - ");

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  let differenceInMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);

  if (differenceInMinutes < 0) {
    differenceInMinutes += 24 * 60;
  }

  const hoursOfDifference = Math.floor(differenceInMinutes / 60);

  return parseInt(hoursOfDifference);
}

function validateBirthDate(dateString) {
  try {
    const date = new Date(dateString);
    if (date && date.getFullYear() > 1900) {
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear() - (today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate()));
      if(!age) {
        return false;
      }
      if (age >= 10) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

const userCreateValidation = () => {
  return [
    body("email")
      .isString().withMessage("O email é obrigatório.")
      .isEmail().withMessage("Insira um email válido."),
    body("password")
      .isString().withMessage("A senha é obrigatória.")
      .isLength({min: 5}).withMessage("A senha precisa ter no mínimo 5 caracteres."),
    body("confirmPassword")
      .isString().withMessage("A confirmação da senha é obrigatória.")
      .custom((value, {req}) => {
        if(value != req.body.password) {
          throw new Error("A confirmação de senha não é igual a senha.")
        }
        return true;
      })
  ];
}

const loginValidation = () => {
  return [
    body("email")
      .isString().withMessage("O email é obrigatório.")
      .isEmail().withMessage("Insira um email válido."),
    body("password")
      .isString().withMessage("A senha é obrigatória."),
  ]
}

const userUpdateValidation = () => {
  return [
    body("password")
      .optional()
      .isLength({min: 5}).withMessage("A senha deve ter ao menos 5 caracteres."),
    body("birth_date")
      .optional()
      .isLength({min: 10}).withMessage("Informe uma data de nascimento válida.")
      .custom((value) => {
        if(value && !validateBirthDate(value)) {
          throw new Error(`Informe uma data de nascimento válida. O usuário deve ter pelo menos 10 anos de idade`);
        }
        return true;
      }),
    body("region")
      .optional()
      .isString().withMessage("Insira uma região válida.")
  ]
}

const userUpdateGameValidation = () => {
  return [
    body("dailyOnlineTime")
      .custom((value, {req}) => {
        if(req.body.validations.includes('dailyOnlineTime')) {
          if (typeof value !== 'string' || !value) {
            throw new Error("Insira uma janela de tempo diária válida.");
          }
          if (value.length < 13) {
            throw new Error("Insira uma janela de tempo diária completa, com horas e minutos.");
          }
          const hoursOfDifference = timeDifference(value);
          if (hoursOfDifference > 16) {
            throw new Error(`Vamos lá, seja realista. Você não joga ${hoursOfDifference} horas por dia!`);
          }
        }
        return true;
      }),
    body("mains")
      .custom((value, {req}) => {
        if(req.body.validations.includes('mains')) {
          if (typeof value !== 'string' || !value) {
            throw new Error("Informe os três campeões que você mais joga.");
          }
          const regex = /,/g;
          const occurrences = value.match(regex);
          if(!occurrences || occurrences.length === 0) {
            throw new Error("Informe mais dois campeões que você joga.");
          } else {
            if(occurrences.length === 1) {
              throw new Error("Informe mais um campeão que você joga.");
            }
          }
        }
        return true;
      }),
    body("description")
      .custom((value, {req}) => {
        if(req.body.validations.includes('description')) {
          if (typeof value !== 'string') {
            throw new Error("Adicione uma descrição para podermos te conhecer melhor.");
          }
          if (value.length < 20) {
            throw new Error("Informe uma descrição maior.");
          }
        }
        return true;
      }),
    body("nickname")
      .custom((value, {req}) => {
        if(req.body.validations.includes('nickname')) {
          if (typeof value !== 'string') {
            throw new Error("Informe um nick de jogador válido.");
          }
          if (value.length < 1) {
            throw new Error("Informe um nick de jogador maior.");
          }
        }
        return true;
      }),
    body("playtime")
      .custom((value, {req}) => {
        if(req.body.validations.includes('playtime')) {
          if (!Number.isInteger(value) && value !== 0) {
            throw new Error("Informe um tempo de jogo válido.");
          }
          if (value < 0) {
            throw new Error("Informe um tempo de jogo maior.");
          }
        }
        return true;
      }),
    body("level")
      .custom((value, {req}) => {
        if(req.body.validations.includes('level')) {
          if (!Number.isInteger(value)) {
            throw new Error("Informe um nível de jogador válido.");
          }
          if (value < 0) {
            throw new Error("Informe um nível de jogador maior.");
          }
        }
        return true;
      }),
    body("elo")
      .custom((value, {req}) => {
        if(req.body.validations.includes('elo')) {
          if (!value) {
            throw new Error("Informe um elo.");
          }
        }
        return true;
      }),
  ]
}

module.exports = {
  timeDifference,
  validateBirthDate,
  userCreateValidation,
  loginValidation,
  userUpdateValidation,
  userUpdateGameValidation
}