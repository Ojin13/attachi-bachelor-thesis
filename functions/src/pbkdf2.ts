import {DerivedKey} from "./types";
const pbkdf2 = require("pbkdf2");

// Since we are using AES-256-CBC, the output length should be 32 bytes as the key length for AES-256-CBC is 256 bits
const hashOutputLength = 32;

/**
 * This function is used to derive a key from an input value using the PBKDF2 algorithm.
 * @param {string} inputValue - The input value to derive the key from
 * @param {string} salt - The salt to be used in the key derivation process (different for each user)
 * @return {string} - The derived key in hexadecimal format
*/
export function deriveKey(inputValue : string, salt : string) : DerivedKey {
  // PBKDF2-HMAC-SHA512 is considered to be more future-proof than PBKDF2-HMAC-SHA256
  const digest = "sha512";

  // According to the OWASP, the recommended number of iterations for PBKDF2 using SHA-512 is 210000.
  // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
  const iterations = 21000;

  const key = pbkdf2.pbkdf2Sync(inputValue, salt, iterations, hashOutputLength, digest);
  return {bytes: key, hex: key.toString("hex")};
}

/**
 * This function is used to derive a key from an input value using the PBKDF2 algorithm.
 * This function is used for the old encryption system. With this, we can migrate users to the new system.
 * @param {string} inputValue - The input value to derive the key from
 * @return {string} - The derived key in hexadecimal format
 */
export function deriveKeyOldSystem(inputValue : string) {
  const key = pbkdf2.pbkdf2Sync(inputValue, process.env.SALT, 8, 16, "sha512").toString("hex");
  return key;
}


/**
 * This function generates a random salt to be used in the key derivation process.
 * New salt is generated for each user on registration.
 * @return {string} - The random salt in hexadecimal format
*/
export function generateRandomSalt() : string {
  const crypto = require("crypto");

  // Salt length should always be at least the same as the
  // output length of the hash function it will be used with
  return crypto.randomBytes(hashOutputLength).toString("hex");
}
