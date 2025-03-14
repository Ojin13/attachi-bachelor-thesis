import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";
import {DataEncrypter} from "../dataEncryption";


/**
 * This function manages the notes for the user.
 * It can get all notes, create a new note, update a note, or delete a note.
 * @param {RequestData} requestData - The data needed to manage the notes
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @return {Promise<Object>} - The note data
 * @throws {Error} - If action is not supported or more data is needed to perform this operation
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient, dataEncrypter : DataEncrypter) {
  // Check if all needed data provied
  if (!requestData.contact_id) {
    throw new Error("More data needed to perform this operation!");
  }

  // Choose specific action
  if (requestData.specificAction == "getNotes") {
    const query = {
      where: {
        contact_id: requestData.contact_id,
        user_uid: context.auth!.uid,
      },
    };

    const quickNotes = await prisma.contactNotes.findMany(query);

    const jsonData = {};
    quickNotes.forEach(function(note) {
      jsonData[note.id] =
          {
            text: dataEncrypter.decryptData(note.note),
            lastUpdateDate: dataEncrypter.decryptData(note.last_modification_date),
            id: note.id
          };
    });

    return jsonData;
  } else if (requestData.specificAction == "createNote") {
    // Check if all needed data provied
    if (requestData.quick_note_text == undefined || requestData.localTime == undefined) {
      throw new Error("More data needed to perform this operation!");
    }

    const newNote = await prisma.contactNotes.create({
      data: {
        contact_id: requestData.contact_id,
        note: dataEncrypter.encryptData(requestData.quick_note_text),
        last_modification_date: dataEncrypter.encryptData(requestData.localTime),
        user_uid: context.auth!.uid,
      },
    });

    return {id: newNote.id, note: dataEncrypter.decryptData(newNote.note), last_modification_date: dataEncrypter.decryptData(newNote.last_modification_date)};
  } else if (requestData.specificAction == "deleteNote") {
    // Check if all needed data provied
    if (requestData.quick_note_id == undefined) {
      throw new Error("More data needed to perform this operation!");
    }

    const query = {
      where: {
        user_uid: context.auth!.uid,
        contact_id: requestData.contact_id,
        id: requestData.quick_note_id,
      },
    };

    const deletedQuickNote = await prisma.contactNotes.deleteMany(query);
    return deletedQuickNote;
  } else if (requestData.specificAction == "updateNote") {
    // Check if all needed data provied
    if (requestData.quick_note_id == undefined || requestData.updated_note_text == undefined) {
      throw new Error("More data needed to perform this operation!");
    }

    const query = {
      where: {
        user_uid: context.auth!.uid,
        contact_id: requestData.contact_id,
        id: requestData.quick_note_id,
      },
      data: {
        note: dataEncrypter.encryptData(requestData.updated_note_text),
      },
    };

    const updatedQuickNote = await prisma.contactNotes.updateMany(query);
    return updatedQuickNote;
  } else {
    throw new Error("Action not supported!");
  }
}
