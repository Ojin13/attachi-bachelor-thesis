import {PrismaClient} from "@prisma/client";
import {CallableContext} from "firebase-functions/v1/https";


/**
 * This function checks if a user exists in the database
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @return {Promise<boolean>} - True if user exists, false otherwise
 */
export async function main(context : CallableContext, prisma: PrismaClient) {
  const query = {
    where: {
      uid: context.auth!.uid,
    },
  };

  const user = await prisma.users.findMany(query);

  if (user.length == 0) {
    return false;
  } else {
    return true;
  }
}


