const {body} = require("express-validator");

// const isValidDate = (dateString) => {
//   console.log("ENTROU NO TESTE DE DATA: ", dateString)
//   const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

//   if (!dateRegex.test(dateString)) {
//     return false;
//   }

//   console.log("PASSOU TESTE DE TAMANHO")

//   const parts = dateString.split('-');
//   const year = parseInt(parts[0], 10);
//   const month = parseInt(parts[1], 10);
//   const day = parseInt(parts[2], 10);

//   if (isNaN(year) || isNaN(month) || isNaN(day)) {
//     return false;
//   }
//   console.log("PASSOU TESTE DE ANO")

//   if (month < 1 || month > 12) {
//     return false;
//   }
//   console.log("PASSOU TESTE DE MES")

//   const daysInMonth = new Date(year, month, 0).getDate();
//   if (day < 1 || day > daysInMonth) {
//     return false;
//   }
//   console.log("PASSOU TESTE DE DIA")

//   const today = new Date();
//   const minAllowedDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());

//   const inputDate = new Date(year, month - 1, day);
//   console.log("PASSOU TESTE DE DATA MAXIMA")
//   return inputDate <= minAllowedDate;
// };

const userCreateValidation = () => {
  return [
    body("email")
      .isString().withMessage("O email é obrigatório")
      .isEmail().withMessage("Insira um email válido."),
    body("password")
      .isString().withMessage("A senha é obrigatória")
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
  ]
}

const userUpdateGameValidation = () => {
  return [
    body("dailyOnlineTime")
      .isString().withMessage("Insira uma janela de tempo válida.")
      .isLength({min: 13}).withMessage("Insira uma janela de tempo válida."),
    body("description")
      .isString().withMessage("Adicione uma descrição.")
      .isLength({min: 10}).withMessage("Adicione uma descrição um pouco maior."),
    body("nickname")
      .isString().withMessage("Insira um nickname válido.")
      .isLength({min: 3}),
    body("playtime")
      .isNumeric().withMessage("O tempo de jogo é obrigatório."),
    body("level")
      .isNumeric().withMessage("O nível de jogador é obrigatório."),
    body("elo")
      .optional(),
    body("mains")
      .custom((value) => {
        if (!Array.isArray(value) || value.length !== 3) {
          throw new Error("Você deve informar pelo menos 3 campeões principais.");
        }
        return true;
      }),
  ]
}

module.exports = {
  userCreateValidation,
  loginValidation,
  userUpdateValidation,
  userUpdateGameValidation
}