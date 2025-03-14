import {deriveKey, deriveKeyOldSystem} from "./pbkdf2";

const crypto = require("crypto");

/**
 * This class is used to encrypt and decrypt all user data.
 * It uses a double encryption to ensure that the encryption key can be stored on the client.
 * The encryption key is derived from the user's password using PBKDF2.
 * The encryption key is also encrypted with a recovery code and stored in the database.
 * The recovery code is used to recover the encryption key if the user forgets their password.
 */
export class DataEncrypter {
  pbkdfEncryptionKey: string;
  pbkdfEncryptionKeyOldSystem: string;
  plainDataKey: string;
  salt: string;
  IV: string;
  keyAccepted = false;

  constructor(encryptionKey: string) {
    try {
      // First layer of encryption - Remove double encryption (double encryption allows to save the encryption key on client)
      const doubleIV = encryptionKey.slice(0, 32);
      encryptionKey = encryptionKey.slice(32);

      const doubleDecipher = crypto.createDecipheriv(process.env.ALGORITHM, Buffer.from(process.env.DOUBLE_ENCRYPTION_KEY as string, "hex"), Buffer.from(doubleIV, "hex"));
      let obscureEncryptedDataKey = doubleDecipher.update(encryptionKey, "hex", "utf8") + doubleDecipher.final("utf8");

      // After removing double encryption, obscureEncryptedDataKey is following format:
      // base64(salt + IV + encryptedDataKey + keyForDataKey) Where encryptedDataKey is encrypted with keyForDataKey
      // So first we need to remove base64 encoding and then split encryptedDataKey and keyForDataKey
      obscureEncryptedDataKey = Buffer.from(obscureEncryptedDataKey, "base64").toString("utf8");

      this.salt = obscureEncryptedDataKey.slice(0, 64);
      obscureEncryptedDataKey = obscureEncryptedDataKey.slice(64);

      this.IV = obscureEncryptedDataKey.slice(0, 32);
      obscureEncryptedDataKey = obscureEncryptedDataKey.slice(32);

      // Extract concatenated encryptedDataKey and keyForDataKey so we can
      // remove the original encryption and get the pure data_key
      const keyForDataKey = obscureEncryptedDataKey.slice(-64);
      const encryptedDataKey = obscureEncryptedDataKey.slice(0, -64);
      const decipher = crypto.createDecipheriv(process.env.ALGORITHM, Buffer.from(keyForDataKey, "hex"), Buffer.from(this.IV, "hex"));

      // Decipher data_key and use pbkdf2Sync to convert it to true key format
      this.plainDataKey = decipher.update(encryptedDataKey, "hex", "utf8") + decipher.final("utf8");
      this.pbkdfEncryptionKey = deriveKey(this.plainDataKey, this.salt).hex;
      this.pbkdfEncryptionKeyOldSystem = deriveKeyOldSystem(this.plainDataKey);
      this.keyAccepted = true;
    } catch (e) {
      console.error("Data encryption error: ", e);
      this.keyAccepted = false;
      this.plainDataKey = "";
      this.pbkdfEncryptionKey = "";
      this.pbkdfEncryptionKeyOldSystem = "";
      this.salt = "";
      this.IV = "";
    }
  }

  encryptData(data: string) : string {
    try {
      const randomIV = this.generateRandomIV();
      const cipher = crypto.createCipheriv(process.env.ALGORITHM, Buffer.from(this.pbkdfEncryptionKey, "hex"), Buffer.from(randomIV, "hex"));
      return randomIV + (cipher.update(data, "utf8", "hex") + cipher.final("hex"));
    } catch (e) {
      return "Encryption error";
    }
  }

  decryptData(data: string) : string {
    try {
      // extract IV from data - first 16 bytes
      const IV = data.slice(0, 32);
      const encryptedData = data.slice(32);
      const decipher = crypto.createDecipheriv(process.env.ALGORITHM, Buffer.from(this.pbkdfEncryptionKey, "hex"), Buffer.from(IV, "hex"));
      return decipher.update(encryptedData, "hex", "utf8") + decipher.final("utf8");
    } catch (originalError) {
      // If decryption failed, it might be due to the fact that data are encrypted with old encryption system.
      // In this case, we will try to decrypt the data with the old encryption system.
      return this.decryptDataOldSystem(data);
    }
  }


  decryptDataOldSystem(data: string) : string {
    try {
      const decipher = crypto.createDecipheriv(process.env.ALGORITHM, this.pbkdfEncryptionKeyOldSystem, process.env.IV);
      return decipher.update(data, "hex", "utf8") + decipher.final("utf8");
    } catch (e) {
      return "Decryption error";
    }
  }

  generateRandomIV() : string {
    // For AES CBC mode, IV must be 16 bytes as it is the block size
    return crypto.randomBytes(16).toString("hex");
  }

  generateRecoveryCode() : string {
    // Format XXXX-XXXX-XXXX-XXXX
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let recoveryCode = "";
    const recoveryCodeSectionLength = 4;

    for (let i = 0; i < recoveryCodeSectionLength; i++) {
      for (let j = 0; j < recoveryCodeSectionLength; j++) {
        recoveryCode += characters.charAt(Math.floor(Math.random() * charactersLength));
      }

      if (i < recoveryCodeSectionLength-1) {
        recoveryCode += "-";
      }
    }

    return recoveryCode;
  }
}
