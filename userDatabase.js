// userDatabase.js
const username = process.env.integrationhublogsusername;
const password = process.env.integrationhublogpassword;
console.log(process.env);
console.log(username);
console.log(password);
module.exports = {
  findByUsername: function (usernameToCheck) {
    if (usernameToCheck === username) {
      return password;
    } else {
      return null; // Return null for non-existent users
    }
  },
};
