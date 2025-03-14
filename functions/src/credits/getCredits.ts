import * as creditRecharge from "./updateCredits";
import {PrismaClient, userCredits} from "@prisma/client";
import {CallableContext} from "firebase-functions/v1/https";
import {getDateInOneMonth, defaultCreditRecharge} from "../webScrapping";
import {CreditData} from "../types";

/**
 * This function returns the credits data for signed-in user.
 * If the user has no credit record yet, it creates one wth default values.
 * Also recharges credits for this month if its time to auto recharge.
 * @param {CallableContext} context - Firebase function context
 * @param {PrismaClient} prisma - PrismaClient instance
 * @return {CreditData} CreditData - Object containing credits and nextAutoRecharge date
 */
export async function main(context : CallableContext, prisma : PrismaClient) {
  let creditsData : CreditData = {
    credits: defaultCreditRecharge,
    nextAutoRecharge: getDateInOneMonth()
  };

  // Get the credits record for this user
  const credits : userCredits | null = await prisma.userCredits.findUnique({
    where: {
      user_uid: context.auth?.uid
    }
  });

  // If no credit record for this user was found, create one
  if (!credits) {
    await prisma.userCredits.create({
      data: {
        user_uid: context.auth!.uid,
        credit_amount: defaultCreditRecharge,
        next_auto_recharge: getDateInOneMonth()
      }
    });
  } else {
    // If credits record was found, check if its time to auto recharge credits for this month
    const today = new Date().toISOString().split("T")[0];
    const nextRechargeDate = credits.next_auto_recharge;

    if (nextRechargeDate <= today) {
      creditRecharge.main(context, prisma, defaultCreditRecharge, true);
    } else {
      // Return current credits data if its not time to auto recharge yet
      creditsData = {
        credits: Number(credits.credit_amount),
        nextAutoRecharge: credits.next_auto_recharge
      };
    }
  }

  return creditsData;
}
