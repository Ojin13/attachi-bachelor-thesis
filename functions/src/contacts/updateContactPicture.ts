import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";

/**
 * This function updates the profile picture of a contact in the database.
 * If no new profile picture name is provided, it will delete the profile picture.
 * If no profile picture is found, it will create a new one.
 * @param {RequestData} requestData - The data needed to update a contact's profile picture
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @return {Promise<Object>} - The updated contact profile picture data
 * @throws {Error} - If contact id is not provided
 */
export async function main(requestData: RequestData, context : CallableContext, prisma : PrismaClient) {
  if (!requestData.contact_id) {
    throw new Error("More data needed to perform this operation!");
  }

  let updateProfilePicture;

  // If new profile picture name is undefined, then we are deleting the profile picture and not updating it
  if (!requestData.new_profile_pic_name) {
    const query = {
      where: {
        contact_id: requestData.contact_id,
        user_uid: context.auth!.uid,
      },
    };

    updateProfilePicture = await prisma.contactMedia.deleteMany(query);
  } else {
    // Set new profile picture name
    const query = {
      where: {
        contact_id: requestData.contact_id,
        user_uid: context.auth!.uid,
      },
      data: {
        media_name: requestData.new_profile_pic_name,
      },
    };

    updateProfilePicture = await prisma.contactMedia.updateMany(query);


    // If no profile picture was found, then we create a new one
    if (updateProfilePicture.count == 0) {
      updateProfilePicture = await prisma.contactMedia.create({
        data: {
          contact_id: requestData.contact_id,
          media_name: requestData.new_profile_pic_name,
          user_uid: context.auth!.uid,
        },
      });
    }
  }

  return updateProfilePicture;
}
