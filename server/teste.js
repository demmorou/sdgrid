var CryptoJS = require("crypto-js");
 
var data = { cpu: 0.9554455445544554,
    memory: 7.658821105957031,
    id: 'U4O3Ip1xg6f2AShxAAAD'}
var key = 'PBqVn1krLL5l7GKn';
// Encrypt
var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key);
 
texto = ciphertext.toString()
console.log(texto)
// Decrypt
// var texto = 'U2FsdGVkX19vPTcIqXWUVgrbYvwC/m4GI9Dn5XVOpTRK8Pvjhf0zevdzOWs6jrBI'

var bytes  = CryptoJS.AES.decrypt(texto, key);
var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
 
console.log(decryptedData);