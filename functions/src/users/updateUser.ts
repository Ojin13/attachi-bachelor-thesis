import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";

/**
 * This function updates the user name in the database for the user.
 * @param {RequestData} requestData - The data needed to update the user name
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @return {Promise<string>} - The success message
 * @throws {Error} - If more data is needed to perform this operation
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient) {
  if (requestData.specificAction == "updateUserName") {
    if (!requestData.newUserName) {
      throw new Error("More data needed to perform this operation!");
    }

    const query = {
      where: {
        uid: context.auth!.uid,
      },
      data: {
        name: requestData.newUserName,
      },
    };

    await prisma.users.update(query);
  } else {
    throw new Error("Unknown update action");
  }

  return "User updated";
}
