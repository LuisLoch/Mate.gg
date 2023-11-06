const multer = require("multer");
const path = require("path");

//destination to store images
const imageStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    let folder = "";

    if(req.baseUrl.includes("users")){ 
      folder = "users"
    }

    callback(null, `uploads/${folder}/`);
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname))
  }
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      //uploads only png and jpg formats
      return callback(new Error("Apenas os formatos .png e .jpg são aceitos."));
    }
    callback(undefined, true);
  }
});

module.exports = {
  imageUpload
};