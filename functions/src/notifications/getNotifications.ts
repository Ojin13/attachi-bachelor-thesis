import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";

/**
 * This function gets all notifications for the user. It also checks if the notifications have been read by the user.
 * User is shown all notifications that were created after the user's registration date.
 * @param {RequestData} requestData - The data needed to get the notifications
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @return {Promise<Object>} - The notification data
 * @throws {Error} - If more data is needed to perform this operation
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient) {
  if (!requestData.userRegistrationDate) {
    throw new Error("More data needed to perform this operation");
  }

  const notifications = await prisma.notifications.findMany({
    where: {
      created_at: {
        gte: new Date(requestData.userRegistrationDate),
      },
    },
  });

  const readNotifications = await prisma.readNotifications.findMany({
    where: {
      user_uid: context.auth!.uid,
    },
  });

  let listOfReadNotificationIds: any = [];
  if (readNotifications.length > 0 && readNotifications[0].notification_ids) {
    listOfReadNotificationIds = readNotifications[0].notification_ids.split(";");
  }

  // Response must be manually converted to JSON, since Date cannot be serialized
  const jsonData = {};
  notifications.forEach(function(notification) {
    jsonData[notification.id] =
          {
            id: notification.id.toString(),
            heading: notification.heading,
            content: notification.content,
            contentPreview: notification.content_preview,
            imageUrl: notification.image_url,
            link: notification.external_link,
            linkText: notification.external_link_text,
            creationDate: notification.created_at.toISOString(),
            read: (listOfReadNotificationIds.includes(notification.id.toString())),
          };
  });

  return jsonData;
}
