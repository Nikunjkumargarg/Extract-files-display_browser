// userDatabase.js
const username = "admin";
const password = "password";

module.exports = {
  findByUsername: function (usernameToCheck) {
    if (usernameToCheck === username) {
      return password;
    } else {
      return null; // Return null for non-existent users
    }
  },
};
