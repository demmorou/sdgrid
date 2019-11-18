const QuickEncrypt = require('quick-encrypt')
// const crypto = require("crypto");
const CryptoJS = require("crypto-js");

class RSA {
    constructor() {
        let keys = QuickEncrypt.generate(2048);
        this.publicKey = keys.public;
        this._privateKey = keys.private;
    }

    getPublicKey() {
        return this.publicKey;
    }

    toEncrypt(dados, public_key) {
        var texto = JSON.stringify(dados);
        var key = 'asdasd';

        var message = CryptoJS.AES.encrypt(texto, key);

        var heap = QuickEncrypt.encrypt(key, public_key);
        return {heap:heap, message:message}
    }

    toDecrypt(dados) {
        let key = QuickEncrypt.decrypt(dados.heap, this._privateKey);
        let texto = dados.message

        var bytes  = CryptoJS.AES.decrypt(texto.toString(), key);
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);

        return JSON.parse(plaintext)
    }
}

module.exports = RSA;

// const rsa = new RSA();

// dados = { cpu: 0.8049382716049382,
//     memory: 7.658805847167969,
//     publicKey: '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAoZxpT9Jj8gq49Z74jBPKs0LbxhWpzAC1grS+JBTJWyIvX9lkDdhzPcOLNEBm\nfFUdmQOIeO2uDIOrLRCoOZY8GXqiJJR72uCkpA3KHKNnvn9xdeFIQIlBQiHVMg6yPhiSd2eI\n4FoigbGIfofuye0/O9lMXmglYBb+Rv1a9o6odfWYLADLi3D8d03yeBJTkIQPhYphA7ny8MNK\n2tgTjjqoZj/wLQ+S3GL1njQjkY9Nn4B+YT5PV9bsE6ncBSpr+z5eMXxAEXFottm0DaNDghBM\nMvqzadUO4Q4zEdp0kGB9jdvyvBEhx+hs6Kd1MI39loDlGom062r62GF4IybpPDSuTQIDAQAB\n-----END RSA PUBLIC KEY-----\n' };

// var crip = rsa.toEncrypt(dados, rsa.publicKey);
// // console.log(crip)

// console.log(rsa.toDecrypt(crip))