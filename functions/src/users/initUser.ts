import {PrismaClient} from "@prisma/client";
import {YesNoValue, RequestData} from "../types";
import {CallableContext} from "firebase-functions/v1/https";
import {deriveKey, generateRandomSalt} from "../pbkdf2";

/**
 * This function gets data for user initialization and creates user in the database on the first login.
 * @param {RequestData} requestData - The data needed to initialize a user
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @return {Promise<Object>} - The encryption key for the user
 * @throws {Error} - If user data is not provided
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient) {
  // Check if all needed data provied
  if (!requestData.hashedUserPassword || !requestData.name || !requestData.email) {
    throw new Error("More data needed to perform this operation!");
  }

  const crypto = require("crypto");

  // Check if user already exists or if this is first login
  let currentUser;

  currentUser = await prisma.users.findUnique({
    where: {
      uid: context.auth!.uid,
    }
  });

  // Determine if user was registered with old encryption system and if this is first login
  let userFromOldSystem = false;
  let isFirstLogin = false;

  if (!currentUser) {
    isFirstLogin = true;
  } else {
    if (!currentUser.last_login_date) {
      userFromOldSystem = true;
    } else {
      const registrationDate = new Date(currentUser.last_login_date.toString());
      const endOfOldEncryptionSystem = new Date("2024-04-20");
      if (registrationDate < endOfOldEncryptionSystem) {
        userFromOldSystem = true;
      }
    }
  }


  let plainDataKey = "";
  let userSalt = "";

  if (userFromOldSystem) {
    plainDataKey = await initUserFromOldEncryptionSystem(currentUser, requestData);
  }

  requestData.hashedUserPassword = requestData.hashedUserPassword.newSystem;

  
  // Generate random value, that will be encrypted with key derived from user
  // password. This random value will encrypt users data
  if (isFirstLogin || userFromOldSystem) {
    userSalt = generateRandomSalt();

    if (!userFromOldSystem) {
      plainDataKey = crypto.randomBytes(256).toString("hex");
    }
  } else {
    // Get user salt from currentUser.encryption_key (first 32 bytes)
    userSalt = currentUser.encryption_key.slice(0, 64);
  }

  // Derive this key from users password. This key will be used to encrypt plainDataKey
  // This key must be saved in users session and attached in every request to decrypt data
  const keyForDataKey = deriveKey(requestData.hashedUserPassword, userSalt);

  // Encrypt plainDataKey with users hashed password and save it to db
  // This value should be secret and should not be kept on client side, but
  // in order to avoid quering database for this value for each request, an encrypted
  // version of this key will be kept on client (we will just add another layer of encryption
  // but this time the new encryption key will be available only on server)
  let encryptedDataKey = "";

  if (isFirstLogin || userFromOldSystem) {
    // On registration and password change we create random IV that will be used to encrypt plainDataKey.
    const randomIV = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(process.env.ALGORITHM, keyForDataKey.bytes, randomIV);
    encryptedDataKey = userSalt + randomIV.toString("hex") + (cipher.update(plainDataKey, "utf8", "hex") + cipher.final("hex"));
  } else {
    encryptedDataKey = currentUser.encryption_key;
  }

  // Now add second layer of encryption to encryptedDataKey, so we can store it on client
  const secondIV = crypto.randomBytes(16);
  const cipherForClient = crypto.createCipheriv(
      process.env.ALGORITHM,
      Buffer.from(process.env.DOUBLE_ENCRYPTION_KEY as string, "hex"),
      secondIV
  );

  const obscureEncryptionKey = Buffer.from(encryptedDataKey + keyForDataKey.hex, "utf8").toString("base64");
  const encryptionKeyForClient = secondIV.toString("hex") + (cipherForClient.update(obscureEncryptionKey, "utf8", "hex") + cipherForClient.final("hex"));
  
  if (isFirstLogin) {
    // Create new user
    currentUser = await prisma.users.create({
      data: {
        uid: context.auth!.uid,
        name: requestData.name,
        email: requestData.email,
        encryption_key: encryptedDataKey,
      },
    });
  }
  else if (userFromOldSystem) {
    // Update data key as it was re-encrypted with new encryption system.
    // Also and add email to the user and update last login date - it was not tracked in the old system.
    await prisma.users.update({
      where: {
        uid: context.auth!.uid,
      },
      data: {
        encryption_key: encryptedDataKey,
        email: requestData.email,
        last_login_date: new Date().toISOString()
      }
    });
  }
  else {
    // Update last login date
    await prisma.users.update({
      where: {
        uid: context.auth!.uid,
      },
      data: {
        last_login_date: new Date().toISOString()
      }
    });
  }

  return {
    encryptionKey: encryptionKeyForClient,
    reencrypted: (userFromOldSystem ? YesNoValue.Yes : YesNoValue.No),
    hasRecoveryCode: (currentUser.encryption_key_recovery_code == "" ? YesNoValue.No : YesNoValue.Yes),
  };
}

/**
 * This function decrypts encypted data key of the user from the old encryption system by using old encryption configuration.
 * @param {any} currentUser - The current user data from the database
 * @param {RequestData} requestData - The data needed to initialize a user
 * @return {string} - The decrypted plain data key that will be reencrypted with the new encryption system
 * @throws {Error} - If decryption fails
 */
async function initUserFromOldEncryptionSystem(currentUser : any, requestData : RequestData) {
  const crypto = require("crypto");
  const pbkdf2 = require("pbkdf2");

  const keyForDataKey = pbkdf2.pbkdf2Sync(requestData.hashedUserPassword.oldSystem, process.env.SALT, 8, 16, "sha512").toString("hex");
  const encryptedDataKey = currentUser.encryption_key;

  // Decipher encryption_key and return it so it can be reencrypted with new encryption system
  const decipher = crypto.createDecipheriv(process.env.ALGORITHM, keyForDataKey, process.env.IV);
  const plainDataKey = decipher.update(encryptedDataKey, "hex", "utf8") + decipher.final("utf8");
  return plainDataKey;
}
