import {PrismaClient} from "@prisma/client";
import {CallableContext} from "firebase-functions/v1/https";
import {DataEncrypter} from "./dataEncryption";
import {deriveKey} from "./pbkdf2";

/**
 * This function creates a new recovery code for the user and saves it to the database encrypted with the data encryption key.
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @return {Promise<Object>} - The recovery code and the plain encryption key
 */
export async function main(context : CallableContext, prisma : PrismaClient, dataEncrypter : DataEncrypter) {
  const newRecoveryCode = await generateRecoveryCodeForUID(prisma, context.auth!.uid, dataEncrypter);
  
  return {
    recoveryCode: newRecoveryCode
  };
}


/**
 * This function generates a new recovery code for the user based on the provided UID.
 * Therefore, user does not need to be logged in to generate a new recovery code - only UID is needed.
 * This is useful when user resets password with recovery code and needs to generate a new one without being logged in.
 * 
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {string} uid - The UID of the user for which the recovery code should be generated
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @return {Promise<string>} - The recovery code generated for the user
 */
export async function generateRecoveryCodeForUID(prisma : PrismaClient, uid : string, dataEncrypter : DataEncrypter) {
  const crypto = require("crypto");

  const decryptedDataKey = dataEncrypter.plainDataKey;

  // Generate new recovery code
  const recoveryCode = dataEncrypter.generateRecoveryCode();

  // Generate new IV for recovery code
  const newIV = dataEncrypter.generateRandomIV();

  // Derive encryption key from new recovery code. This key will be used to encrypt decryptedDataKey
  const keyForDataKey = deriveKey(recoveryCode, dataEncrypter.salt);

  // Create object to work with encryption/decription
  const cipher = crypto.createCipheriv(process.env.ALGORITHM, keyForDataKey.bytes, Buffer.from(newIV, "hex"));

  // Encrypt decryptedDataKey with key derived from recovery code and save it to db
  let encryptedDataKey = "";

  encryptedDataKey = dataEncrypter.salt + newIV + (cipher.update(decryptedDataKey, "utf8", "hex") + cipher.final("hex"));

  // Save data key encrypted with recovery code to db
  await prisma.users.update({
    where: {
      uid: uid
    },
    data: {
      encryption_key_recovery_code: encryptedDataKey,
    }
  });

  return recoveryCode;
}
