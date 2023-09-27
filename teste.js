const sign = require('jwt-encode');
const secret = proccess.env.ENCRYPTION_KEY;
const data = {
  sub: '123',
  name: 'oiii',
  iat: 1516239022
};
const jwt = sign(data, secret);
console.log(jwt);