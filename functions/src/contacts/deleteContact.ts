import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";

/**
 * This function deletes a contact with specified id from the database.
 * Also deletes all related data to the contact.
 * @param {RequestData} requestData - The data needed to delete a contact
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @return {Promise<Object>} - Object with number of deleted instances of data related to contact
 * @throws {Error} - If contact id is not provided
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient) {
  if (requestData.id == undefined) {
    throw new Error("Contacts to delete was not specified");
  }


  // To delete contact, we need to delete:
  // 1. Contact data preset answers
  const deletedDataPresetsValues = await prisma.dataPresetAnswers.deleteMany({
    where: {
      user_uid: context.auth!.uid,
      contact_id: {
        in: requestData.id,
      },
    },
  });


  // 2. Contact quick notes
  const deleteContactQuickNotes = await prisma.contactNotes.deleteMany({
    where: {
      user_uid: context.auth!.uid,
      contact_id: {
        in: requestData.id,
      },
    },
  });

  // 3. Contact media
  const deleteContactMedia = await prisma.contactMedia.deleteMany({
    where: {
      user_uid: context.auth!.uid,
      contact_id: {
        in: requestData.id,
      },
    },
  });

  // 4. Contact group links
  const deleteContactGroupLinks = await prisma.contactGroupMembers.deleteMany({
    where: {
      user_uid: context.auth!.uid,
      contact_id: {
        in: requestData.id,
      },
    },
  });

  // 5. Contact itself
  const deletedContact = await prisma.contacts.deleteMany({
    where: {
      user_uid: context.auth!.uid,
      id: {
        in: requestData.id,
      },
    },
  });

  return {
    "deletedContact": deletedContact,
    "DeletedDataPresetValues": deletedDataPresetsValues,
    "deletedContactQuickNotes": deleteContactQuickNotes,
    "deletedContactMedia": deleteContactMedia,
    "deletedContactGroupLinks": deleteContactGroupLinks,
  };
}
