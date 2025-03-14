import * as linkedInScrapper from "./proxycurl";
import * as googleSearchEngine from "./googleSearchEngine";
import * as creditsGetter from "../credits/getCredits";
import * as updateCredits from "../credits/updateCredits";
import {ServerAction, RequestData} from "../types";
import {CallableContext} from "firebase-functions/v1/https";
import {PrismaClient} from "@prisma/client";
import {DataEncrypter} from "../dataEncryption";


export const defaultCreditRecharge = 250;

export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient, dataEncrypter : DataEncrypter) {
  // Check if user has enough credits for craping
  const creditData = await creditsGetter.main(context, prisma);

  if (creditData.credits < 10) {
    // User might have less than 10 credits, but still have a valid scraping token. 
    // If the token is not valid, this will throw an exception
    verifyScrapingToken(requestData.scrapingToken, context, dataEncrypter);
  } else {
    // Check if user already has a scraping token and if not, deduct 5 credits and create a new token
    if (requestData.action == ServerAction.requestScrapingToken) {
      await updateCredits.main(context, prisma, (creditData.credits) - 5);
      return {scrapingToken: createScrapingToken(context, dataEncrypter)};
    } else {
      verifyScrapingToken(requestData.scrapingToken, context, dataEncrypter);
    }
  }

  if (requestData.action == ServerAction.linkedInScrapper) {
    // This action is called only once per scraping, so we can deduct 5 credits here.
    // This will also prevent missuse of the scraping token with tool like Burp Suite.
    // (The other 5 credits are deducted when the token is created)
    updateCredits.main(context, prisma, (creditData.credits) - 5);

    if (requestData.specificAction != "chargeForNoProfileFound") {
      return await linkedInScrapper.main(requestData);
    }
  }

  if (requestData.action == ServerAction.googleSearchEngine) {
    return await googleSearchEngine.main(requestData);
  }
}


function verifyScrapingToken(scrapingToken : string, context : CallableContext, dataEncrypter : DataEncrypter) {
  if (!scrapingToken) {
    throw new Error("No scraping token provided!");
  }

  // Check expiration date
  scrapingToken = dataEncrypter.decryptData(scrapingToken);
  const tokenParts = scrapingToken.split("|");
  const currentTime = Math.round(new Date().getTime() / 1000);

  if (currentTime > parseInt(tokenParts[0])) {
    throw new Error("Scraping token expired!");
  }


  // Check if the token belongs to the user
  if (tokenParts[1] != context.auth?.uid) {
    throw new Error("Scraping token does not belong to the user!");
  }
}


function createScrapingToken(context : CallableContext, dataEncrypter : DataEncrypter) {
  let scrapingToken = "";

  // Get time in 60 seconds
  const expiration = Math.round(new Date().getTime() / 1000) + 60;
  scrapingToken = expiration.toString();

  // Indicate the owner of the token
  scrapingToken += "|" + context.auth?.uid;

  // Encrypt the token
  scrapingToken = dataEncrypter.encryptData(scrapingToken);

  return scrapingToken;
}


export function getDateInOneMonth() {
  // Get today's date
  const today = new Date();
  // Add one month to the current date
  const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
  // Format the date in YYYY-MM-DD
  const formattedDate = nextMonth.toISOString().split("T")[0];

  return formattedDate;
}
