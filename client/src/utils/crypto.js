import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_AES_SECRET || 'fallback-secret-key-123';


export const encryptNoteContent = (text) => {
  if (!text) return '';
  try {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};


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
