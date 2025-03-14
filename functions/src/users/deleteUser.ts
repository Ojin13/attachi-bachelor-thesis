import {PrismaClient} from "@prisma/client";
import {getAuth} from "firebase-admin/auth";
import {CallableContext} from "firebase-functions/v1/https";

/**
 * This function deletes a user from the database as well as their associated data.
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {admin} adminImport - The admin import used to interact with Firebase services
 * @return {Promise<string>} - A message indicating the user has been deleted
 */
export async function main(context : CallableContext, prisma : PrismaClient, adminImport) {
  // First delete also contact links to groups
  await prisma.contactGroupMembers.deleteMany({
    where: {
      user_uid: context.auth!.uid,
    }
  });

  // Then also delete all groups of this user
  await prisma.contactGroups.deleteMany({
    where: {
      user_uid: context.auth!.uid,
    }
  });

  // Then delete read notifications of this user
  await prisma.readNotifications.deleteMany({
    where: {
      user_uid: context.auth!.uid,
    }
  });

  // Then delete credits of this user
  await prisma.userCredits.deleteMany({
    where: {
      user_uid: context.auth!.uid,
    }
  });

  // Only then delete user itself
  await prisma.users.delete({
    where: {
      uid: context.auth!.uid,
    },
  });

  getAuth().deleteUser(context.auth!.uid).then(() => {
    console.log("Successfully deleted user "+context.auth!.uid);
  });

  const destRef = adminImport.storage().bucket();

  // Delete all users images
  await destRef.deleteFiles({
    prefix: `users/${context.auth!.uid}/`
  });

  return "It's done. What did it cost? Everything.";
}
