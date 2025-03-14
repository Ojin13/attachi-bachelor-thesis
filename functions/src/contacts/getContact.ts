import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";
import {DataEncrypter} from "../dataEncryption";

/**
 * This function gets a contact from the database based on the id provided.
 * If no id is provided, it will return all contacts for the user.
 * @param {RequestData} requestData - The data needed to get a contact
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @return {Promise<Object>} - The contact data
 * @throws {Error} - If contact with the id provided is not found
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient, dataEncrypter : DataEncrypter) {
  // Check for invalid request parameter combination
  if (!requestData.id && !requestData.getAllContacts) {
    return {};
  }

  const query = {
    where: {
      user_uid: context.auth!.uid,
      id: requestData.id, // if undefined, this condition is not active
    },
    include: {
      contactMedia: {
        where: {
          user_uid: context.auth!.uid,
        },
        select: {
          media_name: true,
        },
      }
    },
  };

  const contacts = await prisma.contacts.findMany(query);
  const contactsFormated = {};

  contacts.forEach(function(contact) {
    contactsFormated[contact.id] = {
      description: dataEncrypter.decryptData(contact.description),
      name: dataEncrypter.decryptData(contact.name),
      id: contact.id,
      userUID: contact.user_uid,
      pictures: contact.contactMedia,
    };
  });

  if (requestData.id) {
    if (contactsFormated[requestData.id]) {
      return contactsFormated[requestData.id];
    } else {
      throw new Error("Contacts with this ID not found!");
    }
  } else {
    return contactsFormated;
  }
}
