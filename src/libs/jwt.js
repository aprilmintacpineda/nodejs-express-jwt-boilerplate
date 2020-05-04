/** @format */

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { readFileSync } = require('fs');
const path = require('path');

const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

const privateKey = readFileSync(path.join(__dirname, '../jwt.key'));
const publicKey = readFileSync(path.join(__dirname, '../jwt.pub'));

function sign (payload) {
  return signAsync(payload, privateKey, {
    expiresIn: '7d',
    algorithm: 'RS256'
  });
}

function verify (token) {
  return verifyAsync(token, publicKey, { maxAge: '7d' });
}

module.exports.sign = sign;
module.exports.verify = verify;
module.exports.jwtMaxAge = 6048e5;
