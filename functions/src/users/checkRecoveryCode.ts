import {PrismaClient} from "@prisma/client";
import {RequestData} from "../types";
import {deriveKey} from "../pbkdf2";

/**
 * This function checks if the provided recovery code is correct for the user.
 * If the recovery code is correct, it will return the encryption key for client.
 * @param {RequestData} requestData - The data needed to check the recovery code
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @return {Promise<Object>} - The encryption key for the user
 * @throws {Error} - If more data is needed to perform this operation
 */
export async function main(requestData : RequestData, prisma : PrismaClient) {
  // Check if all needed data provied
  if (!requestData.email || !requestData.recoveryCode) {
    throw new Error("More data needed to perform this operation!");
  }

  const crypto = require("crypto");

  // Check the existence of user and his/her recovery code
  // Identify user with email since we don't know the UID
  let user : any;
  user = await prisma.users.findMany({
    where: {
      email: requestData.email,
    },
  });

  // Check if user with provided email exists
  if (user.length == 0) {
    throw new Error("User not found!");
  } else {
    user = user[0];
  }

  // If user with provided email exists, check if he/she has recovery code
  if (!user.encryption_key_recovery_code) {
    throw new Error("User has no recovery code!");
  }

  // Get salt and IV from user.encryption_key_recovery_code
  const saltLength = 64;
  const IVLength = 32;

  const userSalt = user.encryption_key_recovery_code.slice(0, saltLength); // 32 bytes
  const IV = user.encryption_key_recovery_code.slice(saltLength, saltLength + IVLength); // 16 bytes

  const keyForRecoveryCode = deriveKey(requestData.recoveryCode, userSalt);
  const decipher = crypto.createDecipheriv(process.env.ALGORITHM, keyForRecoveryCode.bytes, Buffer.from(IV, "hex"));

  try {
    // Try to decrypt encryptedDataKey with provided recovery code to check if recovery code is correct
    const plainEncryptedDataKey = user.encryption_key_recovery_code.slice(saltLength + IVLength);
    decipher.update(plainEncryptedDataKey, "hex", "utf8") + decipher.final("utf8");

    // If recovery code is correct we can prepare encryption key for the client
    const secondIV = crypto.randomBytes(16);
    const cipherForClient = crypto.createCipheriv(
        process.env.ALGORITHM,
        Buffer.from(process.env.DOUBLE_ENCRYPTION_KEY as string, "hex"),
        secondIV
    );

    const obscureEncryptionKey = Buffer.from(userSalt + IV + plainEncryptedDataKey + keyForRecoveryCode.hex, "utf8").toString("base64");
    const encryptionKeyForClient = secondIV.toString("hex") + (cipherForClient.update(obscureEncryptionKey, "utf8", "hex") + cipherForClient.final("hex"));

    return {
      encryptionKey: encryptionKeyForClient,
    };
  } catch (e) {
    throw new Error("Recovery code is not valid!");
  }
}
