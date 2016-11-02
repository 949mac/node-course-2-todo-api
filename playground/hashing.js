const jwt = require('jsonwebtoken');

var data = {
  id: 10
};

var secret = "momspeghetti"

var token = jwt.sign(data, secret);

var decoded = jwt.verify(token, secret);

console.log(token);
console.log(decoded);
