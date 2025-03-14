import {CallableContext} from "firebase-functions/v1/https";
import {ContactProperties, RequestData} from "../types";
import {PrismaClient} from "@prisma/client";
import {DataEncrypter} from "../dataEncryption";

/**
 * This function updates contact property (name or description) in the database
 * @param {RequestData} requestData - The data needed to update a contact
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @return {Promise<Object>} - The updated contact data
 * @throws {Error} - If contact id, new value or attribute to update is not provided
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient, dataEncrypter : DataEncrypter) {
  // Check if all needed data provided
  if (!requestData.contact_id || !requestData.newValue || !requestData.attributeToUpdate) {
    throw new Error("More data needed to perform this operation!");
  }

  const attributeToUpdate = {};

  switch (requestData.attributeToUpdate) {
    case ContactProperties.name:
      attributeToUpdate["name"] = dataEncrypter.encryptData(requestData.newValue);
      break;
    case ContactProperties.desc:
      attributeToUpdate["description"] = dataEncrypter.encryptData(requestData.newValue);
      break;
    default:
      throw new Error("Invalid data provided!");
  }

  const query = {
    where: {
      user_uid: context.auth!.uid,
      id: requestData.contact_id,
    },
    data: attributeToUpdate,
  };

  const updatedContact = await prisma.contacts.updateMany(query);
  return updatedContact;
}
