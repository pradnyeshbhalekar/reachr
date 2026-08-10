const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

function getKey() {
    const key = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex");
    if (key.length !== 32) {
        throw new Error("ENCRYPTION_KEY must be a 32-byte hex string");
    }
    return key;
}

function encrypt(plaintext) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString("hex"), authTag.toString("hex"), ciphertext.toString("hex")].join(":");
}

function decrypt(payload) {
    const [ivHex, authTagHex, ciphertextHex] = payload.split(":");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(ciphertextHex, "hex")),
        decipher.final(),
    ]);
    return plaintext.toString("utf8");
}

module.exports = { encrypt, decrypt };
