const {body} = require("express-validator");
const {isDate} = require("express-validator")

const isValidDate = (dateString) => {
  console.log("ENTROU NO TESTE: ", dateString)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateString)) {
    return false;
  }

  console.log("PASSOU TESTE DE TAMANHO")

  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }
  console.log("PASSOU TESTE DE ANO")

  if (month < 1 || month > 12) {
    return false;
  }
  console.log("PASSOU TESTE DE MES")

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }
  console.log("PASSOU TESTE DE DIA")

  const today = new Date();
  const minAllowedDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());

  const inputDate = new Date(year, month - 1, day);
  console.log("PASSOU TESTE DE DATA MAXIMA")
  return inputDate <= minAllowedDate;
};

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

const userUpdateGameValidation = (validations) => {
  console.log("comecei")
  validations.forEach(validation => {
    console.log(validation);
  });
  return [
    body("dailyOnlineTime")
      .isString().withMessage("Insira uma janela de tempo válida.")
      .isLength({min: 13}).withMessage("Insira uma janela de tempo válida."),
    body("nickname")
      .isString().withMessage("Insira um nickname válido.")
      .isLength({min: 3}),
    body("description")
      .isString().withMessage("Adicione uma descrição legal para seus teammates verem.")
      .isLength({min: 10}).withMessage("Conte um pouco mais sobre você na descrição."),
    validations.map((validation) => {
      switch (validation.type) {
        case 'dailyOnlineTime':
          return
        case 'optionalString':
          return body(validation.field)
            .optional()
            .isString().withMessage(`O campo ${validation.field} deve ser uma string.`);

        case 'optionalEmail':
          return body(validation.field)
            .optional()
            .isEmail().withMessage(`O campo ${validation.field} deve ser um e-mail válido.`);

        default:
          return null; // Validação padrão para tipos desconhecidos
      }
    }).filter(Boolean)
  ]
}

module.exports = {
  userCreateValidation,
  loginValidation,
  userUpdateValidation,
  userUpdateGameValidation
}