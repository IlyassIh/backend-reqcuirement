import crypto from 'crypto'

const jwt = crypto.randomBytes(64).toString('hex');

console.log("the secret code is : ");
console.log(jwt);
