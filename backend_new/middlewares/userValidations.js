const {body} = require("express-validator");

const userCreateValidation = () => {
  return [
    body("email")
      .isString().withMessage("O email é obrigatório")
      .isEmail().withMessage("Insira um email válido."),
    body("password")
      .isString().withMessage("A senha é obrigatória")
      .isLength({min: 5}).withMessage("A senha precisa ter no mínimo 5 caracteres."),
    body("birth_date")
      .notEmpty().withMessage("A data de nascimento é obrigatória"),
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
    body("name")
      .optional().isLength({min: 3}).withMessage("O nome deve ter ao menos 3 caracteres."),
    body("password")
      .optional().isLength({min: 5}).withMessage("A senha deve ter ao menos 5 caracteres.")
  ]
}

module.exports = {
  userCreateValidation,
  loginValidation,
  userUpdateValidation,
}