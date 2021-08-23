const base64url = require('base64url');

const generateJWK = (keyId, publicKey, modulus, exponent) => {
    const publicKeyBase64Url = base64url.fromBase64(publicKey)
    const modulusBase64Url = base64url.fromBase64(modulus)
    const exponentBase64Url = base64url(exponent.toString())

    return {
        alg: "RS256",
        kty: "RSA",
        use: "sig",
        kid: keyId,
        //x5c: [publicKey],
        n: modulusBase64Url,
        e: 'AQAB'
    }
}

module.exports = generateJWK