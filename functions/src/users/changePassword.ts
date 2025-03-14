import {PrismaClient} from "@prisma/client";
import {VerifierType, RequestData} from "../types";
import {DataEncrypter} from "../dataEncryption";
import {deriveKey} from "../pbkdf2";
import {generateRecoveryCodeForUID} from "../createRecoveryCode";

/**
 * This function changes user's password and generates new recovery code if needed
 * @param {RequestData} requestData - The data needed to change user's password
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {admin} admin - The admin object used to interact with Firebase Auth
 * @return {Promise<Object>} - The new recovery code if generated
 * @throws {Error} - If more data is needed to perform this operation
 */
export async function main(requestData : RequestData, prisma : PrismaClient, admin ) {
  // Check if all needed data provied
  if (!requestData.email || !requestData.plaintextPassword || !requestData.newPassword || !requestData.verifirerType || !requestData.verifier) {
    throw new Error("More data needed to perform this operation!");
  }

  /**
   * User need to provide encryption key which is gained from entering his/her:
   *    1.) Old password that was entered during login (when chaning password once logged in)
   *    2.) Recovery code (when resetting password with recovery code)
   * With this encryption key even if user is not authenticated with Firebase Auth, we know that he/she knows a secret for encryption key.
   */
  if (!requestData.encryptionKey) {
    throw new Error("Encryption key is required!");
  }
  
  const crypto = require("crypto");

  // Check validity of the encryption key
  const dataEncrypter: DataEncrypter = new DataEncrypter(requestData.encryptionKey);
  if (!dataEncrypter.keyAccepted) {
    throw new Error("Encryption data not valid!");
  }

  // Get user based on provided email (UID is not available since user might not be authenticated with Firebase Auth)
  let user;
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
  
  
  // Make sure that provided data key from recovery code/old password matches the data key corresponding to the provided email in the database
  verifyDataKeyForProvidedEmail(requestData, dataEncrypter, user);


  // Re-encrypt data key with new password
  const newPasswordEncryptionKey = deriveKey(requestData.newPassword, dataEncrypter.salt);
  const newIV = dataEncrypter.generateRandomIV();
  const cipher = crypto.createCipheriv(process.env.ALGORITHM, newPasswordEncryptionKey.bytes, Buffer.from(newIV, "hex"));
  const dataKeyEncryptedWithNewPassword = dataEncrypter.salt + newIV + (cipher.update(dataEncrypter.plainDataKey, "utf8", "hex") + cipher.final("hex"));

  // Save re-encrypted data key to database
  await prisma.users.update({
    where: {
      email: requestData.email,
    },
    data: {
      encryption_key: dataKeyEncryptedWithNewPassword
    }
  });

  // Change user's password in Firebase Auth - identity was already verified so we can use UID at this point
  await admin.auth().updateUser(user.uid, {
    password: requestData.plaintextPassword,
  });


  // Generate new recovery code if the old one was used
  if (requestData.verifirerType == VerifierType.RecoveryCode) {
    const newRecoveryCode = await generateRecoveryCodeForUID(prisma, user.uid, dataEncrypter);
    
    return {
      newRecoveryCode: newRecoveryCode,
    };
  }
  
  return {
    passwordChanged: true,
  };
}


/**
 * Since the user is not necessarily authenticated with Firebase Auth, we cant use context.auth.uid for
 * certain identification. Instead we will use provided email to find user in the database. However,
 * since the email, unlike context.auth.uid, could be manipulated by capturing the request, we need
 * need to compare provided requestData.encryptionKey with the one belonging to the provided email.
 * 
 * IMPORTANT:
 * Without this check, an attacker could change the email in the request body to email of any other registered user
 * and change the password for that user, by providing his/her own valid encryption key!
 * 
 * @param {RequestData} requestData - The data needed to change user's password
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @param {any} userConnectedToEmail - The user object connected to the provided email
 * @throws {Error} - If the data key from recovery code/old password does not match the one corresponding to the provided email in the database
 * @return {void}
 */
function verifyDataKeyForProvidedEmail(requestData : RequestData, dataEncrypter : DataEncrypter, userConnectedToEmail : any) {
  const providedDataKey = dataEncrypter.plainDataKey;
  let dataKeyAccordingToEmail = "";
  
  const crypto = require("crypto");
  const verifierKey = deriveKey(requestData.verifier, dataEncrypter.salt);
  const decipher = crypto.createDecipheriv(process.env.ALGORITHM, verifierKey.bytes, Buffer.from(dataEncrypter.IV, "hex"));

  try {
    let encryptedDataKeyFromDB = "";

    if (requestData.verifirerType == VerifierType.RecoveryCode) {
      encryptedDataKeyFromDB = userConnectedToEmail.encryption_key_recovery_code;
    } else {
      encryptedDataKeyFromDB = userConnectedToEmail.encryption_key;
    }

    // Remove salt and IV from the start
    encryptedDataKeyFromDB = encryptedDataKeyFromDB.slice(96);

    // Try to decrypt data key of corresponding email with provided verifier
    dataKeyAccordingToEmail = decipher.update(encryptedDataKeyFromDB, "hex", "utf8") + decipher.final("utf8");

    if (dataKeyAccordingToEmail != providedDataKey) {
      // Attack on encryption key detected
      throw new Error("Data key from recovery code/old password does not match the one corresponding to the provided email in the database!");
    }
  } catch (e : any) {
    throw new Error(e);
  }
}
