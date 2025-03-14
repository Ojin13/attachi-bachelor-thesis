import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";

/**
 * This function marks a notification as read for the user.
 * @param {RequestData} requestData - The data needed to mark a notification as read
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @return {Promise<string>} - Success message
 * @throws {Error} - If more data is needed to perform this operation
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient) {
  if (requestData.notificationId == undefined) {
    throw new Error("More data needed to perform this operation");
  }

  const readNotifications = await prisma.readNotifications.findMany({
    where: {
      user_uid: context.auth!.uid,
    },
  });

  if (readNotifications.length == 0) {
    await prisma.readNotifications.create({
      data: {
        user_uid: context.auth!.uid,
        notification_ids: requestData.notificationId.toString() + ";",
      },
    });
  } else {
    if (readNotifications[0].notification_ids == null) {
      throw new Error("Notification ids not found");
    }

    const listOfReadNotificationIds = readNotifications[0].notification_ids.split(";");
    if (!listOfReadNotificationIds.includes(requestData.notificationId.toString())) {
      await prisma.readNotifications.updateMany({
        where: {
          user_uid: context.auth!.uid,
        },
        data: {
          notification_ids: readNotifications[0].notification_ids + requestData.notificationId.toString() + ";",
        },
      });
    }
  }

  return "Success";
}
