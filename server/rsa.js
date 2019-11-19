const CryptoJS = require("crypto-js");
const rand = require("generate-key");
const QuickEncrypt = require('quick-encrypt')

class RSA {
    constructor(server) {
        var keys = QuickEncrypt.generate(1024);
        if (server) {
            this._key = rand.generateKey();
        }
        this.publicKey = keys.public;
        this._privateKey = keys.private;
    }

    criptKey(publicKey) {
        return QuickEncrypt.encrypt(this._key, publicKey);
    }

    decryptKey(cript) {
        this._key = QuickEncrypt.decrypt(cript, this._privateKey)
        // return QuickEncrypt.decrypt(cript, this._privateKey)
    }

    jsonToCript(dados) {
        return CryptoJS.AES.encrypt(JSON.stringify(dados), this._key).toString();
    }

    criptToJson(cript) {
        let bytes  = CryptoJS.AES.decrypt(cript, this._key);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
}

module.exports = RSA;
// console.log(rand.generateKey(12));

// const QuickEncrypt = require('quick-encrypt')

// class RSA {
//     constructor() {
//         var keys = QuickEncrypt.generate(1024);
//         this.publicKey = keys.public;
//         this._privateKey = keys.private;
//     }

//     jsonToRncrypt() {
        
//     }
// }

// let keys = QuickEncrypt.generate(1024) // Use either 2048 bits or 1024 bits.
// console.log(keys) // Generated Public Key and Private Key pair
// let publicKey = keys.public
// let privateKey = keys.private
 
// // --- Encrypt using public key ---
// let encryptedText = QuickEncrypt.encrypt( "secret key 123", publicKey )
// console.log(encryptedText) // This will print out the ENCRYPTED text, for example : " 01c066e00c660aabadfc320621d9c3ac25ccf2e4c29e8bf4c...... "
 
// // --- Decrypt using private key ---
// let decryptedText = QuickEncrypt.decrypt( encryptedText, privateKey)
// console.log(decryptedText) // This will print out the DECRYPTED text, which is " This is some super top secret text! "
 