import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_AES_SECRET || 'fallback-secret-key-123';

/**
 * Encrypt note content using AES
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Base64 encrypted cipher text
 */
export const encryptNoteContent = (text) => {
  if (!text) return '';
  try {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

/**
 * Decrypt note content using AES
 * @param {string} ciphertext - Encrypted cipher text
 * @returns {string} - Decrypted plain text
 */
export const decryptNoteContent = (ciphertext) => {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) {

      return '[Decryption Failed: Bad Secret Key or Corrupted Content]';
    }
    return originalText;
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Decryption Error]';
  }
};
