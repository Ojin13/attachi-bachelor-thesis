import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";

/**
 * This function creates a new feedback in the database
 * @param {RequestData} requestData - The data needed to create a new feedback
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @return {Promise<Object>} - The new feedback data
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient) {
  if (!requestData.feedback_content) {
    throw new Error("More data needed to perform this operation!");
  }

  const newFeedback = await prisma.feedback.create({
    data: {
      user_uid: context.auth!.uid,
      feedback_content: requestData.feedback_content,
    }
  });

  return newFeedback;
}
