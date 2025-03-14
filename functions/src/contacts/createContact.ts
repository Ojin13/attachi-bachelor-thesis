import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";
import {DataEncrypter} from "../dataEncryption";


/**
 * This function creates a new contact in the database
 * @param {RequestData} requestData - The data needed to create a new contact
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @return {Promise<number>} - The id of the new contact
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient, dataEncrypter : DataEncrypter) {
  const newContact = await prisma.contacts.create({
    data: {
      name: dataEncrypter.encryptData(requestData.name),
      description: dataEncrypter.encryptData(requestData.description),
      user_uid: context.auth!.uid,
    },
  });

  return newContact.id;
}
