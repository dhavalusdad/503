import CryptoJS from 'crypto-js';

const SECRET_KEY = 'default-secret-key';

// const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET || 'default-secret-key';

export const encryptData = (data: unknown): string => {
  const json = JSON.stringify(data);
  return CryptoJS.AES.encrypt(json, SECRET_KEY).toString();
};

export const decryptData = <T = unknown>(cipher: string): T => {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

  if (!decryptedText) {
    throw new Error('Failed to decrypt. Possibly wrong key or corrupt data.');
  }

  return JSON.parse(decryptedText) as T;
};
