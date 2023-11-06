class User {
  constructor(email, password, birth_date, games, photo) {
    this.email = email;
    this.password = password;
    this.birth_date = birth_date;
    this.games = games;
    this.photo = photo;
  }
}

module.exports = User;
