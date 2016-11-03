// const jwt = require('jsonwebtoken');
//
// var data = {
//   id: 10
// };
//
// var secret = "momspeghetti"
//
// var token = jwt.sign(data, secret);
//
// var decoded = jwt.verify(token, secret);
//
// console.log(token);
// console.log(decoded);

const bcrypt = require('bcryptjs');

var password = '123abc!';

console.log(`starting…`);

bcrypt.genSalt(20, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);
  })
})
