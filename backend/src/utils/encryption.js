import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.MESSAGE_SECRET_KEY || '', 'hex');
const ivLength = 16; // For AES, this is always 16

export const encrypt = (text) => {
    if (!text) return text;
    if (!process.env.MESSAGE_SECRET_KEY) {
        console.warn("MESSAGE_SECRET_KEY is missing. Storing plain text.");
        return text;
    }

    try {
        const iv = crypto.randomBytes(ivLength);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error("Encryption error:", error);
        return text; // Fallback to plain text on error to avoid data loss
    }
};

export const decrypt = (text) => {
    if (!text) return text;
    if (!text.includes(':')) return text; // Not encrypted or legacy data
    if (!process.env.MESSAGE_SECRET_KEY) return text;

    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        // If decryption fails (e.g. wrong key, or actually plain text with a colon), return original
        // This helps during migration or if key rotates without re-encrypting old data
        return text;
    }
};
