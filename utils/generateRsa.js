const {generateKeyPairSync} = require('crypto')
const base64url = require('base64url');
const NodeRSA = require('node-rsa')
//const { subtle } = require('crypto').webcrypto;

/*async function generateRsaKey(modulusLength = 2048, hash = 'SHA-256') {
    const {
      publicKey,
      privateKey
    } = await subtle.generateKey({
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength,
      publicExponent,
      hash,
    }, true, ['sign', 'verify']);
  
    return { publicKey, privateKey };
}*/

const generateRsaKey = () => {
  const {
    publicKey,
    privateKey,
  } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      //pkcs8
      format: 'pem',
    }
  });

  return {publicKey, privateKey}
}

//wrap a private RSA key within nodeRSA in order to generate key components like N(modulus) and E(exponent)
const keyWrapper = () => {
  const rsaKey = generateRsaKey()
  
  const nodeRsaKey = new NodeRSA(rsaKey.privateKey)

  const privateKeyPem = nodeRsaKey.importKey(rsaKey.privateKey, 'pkcs1')

  const publicKeyComponents = privateKeyPem.exportKey('components-public')
  publicKeyComponents.n = publicKeyComponents.n.toString('base64')
  const publicKeyPem = privateKeyPem.exportKey('public')
  
  const rawPublicKey = publicKeyPem.replace('-----BEGIN PUBLIC KEY-----', "").replace('-----END PUBLIC KEY-----', "").trim()
  const rawPrivateKey = rsaKey.privateKey.replace('-----BEGIN RSA PRIVATE KEY-----', "").replace('-----END RSA PRIVATE KEY-----', "").trim()
  //console.log(rawPrivateKey, 'public:',rawPublicKey, 'privateRaw:', rsaKey.privateKey, 'publicsRaw:', rsaKey.publicKey)
  return {
    privateKey: rsaKey.privateKey,
    publicKey: publicKeyPem,
    publicKeyComponents
  }
}
const a = keyWrapper()
//console.log(a)

module.exports = keyWrapper