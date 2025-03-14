import {PrismaClient} from "@prisma/client";
import {defaultCreditRecharge, getDateInOneMonth} from "../webScrapping";

/**
 * This function updates the user's credits in the database.
 * @param {CallableContext} context - Firebase function context
 * @param {PrismaClient} prisma - PrismaClient instance
 * @param {number} newAmount - The new amount of user credits
 * @param {boolean} updateRechargeDate - If true, the next auto recharge date will be updated
 * @return {Promise<void>}
 */
export async function main(context, prisma : PrismaClient, newAmount : number = defaultCreditRecharge, updateRechargeDate = false) {
  const requestData = {
    credit_amount: newAmount,
  };

  if (updateRechargeDate) {
    requestData["next_auto_recharge"] = getDateInOneMonth();
  }

  await prisma.userCredits.update({
    where: {
      user_uid: context.auth.uid
    },
    data: requestData
  });
}
