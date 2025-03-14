// Import functions for internal logic
import * as cloudFunctions from "firebase-functions";
import {DataEncrypter} from "./dataEncryption";
import {PrismaClient} from "@prisma/client";
import {adminImport} from "./firebaseAdminSDK";
import {CallableContext} from "firebase-functions/v1/https";

// Import types from the client
import {ServerAction, RequestData, ResponseData} from "./types";

// Data presets related endpoints
import * as datPresetGetter from "./dataPresets/getDataPresets";
import * as datPresetUpdater from "./dataPresets/updateDataPresets";

// User related endpoints
import * as userExistenceChecker from "./users/checkUserExistence";
import * as userInitializer from "./users/initUser";
import * as userDeleter from "./users/deleteUser";
import * as userUpdater from "./users/updateUser";

// Contact related endpoints
import * as contactCreator from "./contacts/createContact";
import * as contactDeleter from "./contacts/deleteContact";
import * as contactGetter from "./contacts/getContact";
import * as contactUpdater from "./contacts/updateContact";
import * as contactPictureUpdater from "./contacts/updateContactPicture";

// Password related endpoints
import * as recoveryCodeGenerator from "./createRecoveryCode";
import * as recoveryCodeChecker from "./users/checkRecoveryCode";
import * as passwordChanger from "./users/changePassword";

// Notification endpoints
import * as notificationGetter from "./notifications/getNotifications";
import * as notificationReader from "./notifications/readNotification";

// Web scraper endpoints
import * as scraper from "./webScrapping";
import * as creditsGetter from "./credits/getCredits";


// Other general endpoints
import * as chatBot from "./openAI/chatBot";
import * as feedbackManager from "./feedback/newFeedback";
import * as groupManager from "./groups/groupManager";
import * as imageManager from "./imageManager";
import * as notesManager from "./quickNotes/notesManager";
import * as versionCheck from "./versionCheck";


// Keep always at least 1 instances warm to avoid cold starts.
const runtimeOptions : cloudFunctions.RuntimeOptions = {
  minInstances: 1,
  maxInstances: 25,
  memory: "1GB"
};

const prisma : PrismaClient = new PrismaClient();
const functionRegion = "europe-west3";

/**
 * This is the core firebase callable function, named "API".It is the only
 * instance of a cloud function in the project as it significantly reduces
 * cost and prevents delays caused by cold starts.
 * 
 * @param data {RequestData} - Data sent from the client
 * @param context {CallableContext} - Context of the function, which holds authentication data
 * @return {Promise<ResponseData>} - Response data to be sent back to the client. 
 * 
 * Code 500 is returned in case of any error
 * Code 200 is returned in case of successful execution
 * 
 * For more information about Firebase callable functions, see:
 * https://firebase.google.com/docs/functions/callable?gen=2nd
 * 
 * For more information about cloud function cold starts, see:
 * https://firebase.google.com/docs/functions/tips#performance
 * https://www.youtube.com/watch?v=v3eG9xpzNXM
 */
export const API = cloudFunctions.runWith(runtimeOptions).region(functionRegion).https.onCall((data : RequestData, context : CallableContext) => {
  return main(data, context)
      .then(async (result) : Promise<ResponseData> => {
        prisma.$disconnect();
        return {answer: result, code: 200};
      })
      .catch(async (e) => {
        prisma.$disconnect();
        return {error: e.message, code: 500};
      });
});


/**
 * Helper function to check unauthenticated endpoints
 * @param {RequestData} requestData - Data sent from the client
 * @param {CallableContext} context - Context of the function, which holds authentication data
 * @return {Promise<unknown>} - Response data to be sent back to the client or null if no match for the action is found.
 */
async function checkUnauthenticatedEndpoints(requestData : RequestData, context : CallableContext) {
  if (requestData.action == ServerAction.checkUserExistence) {
    const answer = await userExistenceChecker.main(context, prisma);
    return answer;
  }

  if (requestData.action == ServerAction.checkRecoveryCode) {
    const answer = await recoveryCodeChecker.main(requestData, prisma);
    return answer;
  }

  if (requestData.action == ServerAction.changePassword) {
    const answer = await passwordChanger.main(requestData, prisma, adminImport);
    return answer;
  }

  return null;
}


/**
 * This function checks if the user is authenticated. It is used to prevent
 * unauthorized access to the endpoints that require authentication.
 * @param {RequestData} requestData - Data sent from the client
 * @param {CallableContext} context - Context of the function, which holds authentication data
 * @return {boolean} - True if user is authenticated, false otherwise.
 */
function isAuthenticated(requestData : RequestData, context : CallableContext) {
  if (!context.auth) {
    return false;
  }

  // Check if encryption key is provided. If user is just initializing
  // the session, we do not require encryption key yet.
  if (!requestData.encryptionKey && requestData.action != ServerAction.initUser) {
    return false;
  }

  return true;
}

/**
 * Helper function to prepare the data encrypter
 * @param {RequestData} requestData - Data sent from the client
 * @return {DataEncrypter | null} - DataEncrypter object or null if no valid encryption key is provided.
 * also returns null if the action is "initUser" as we do not require encryption key for this action.
 * @throws {Error} - If encryption key is not provided or is not valid.
 */
function prepareDataEncrypter(requestData : RequestData): DataEncrypter | null {
  let dataEncrypter : DataEncrypter | null = null;

  if (requestData.action != ServerAction.initUser) {
    if (!requestData.encryptionKey) {
      throw new Error("Encryption key not provided!");
    }
    
    dataEncrypter = new DataEncrypter(requestData.encryptionKey);

    if (!dataEncrypter.keyAccepted) {
      throw new Error("Encryption data not valid!");
    }
  }

  return dataEncrypter;
}


/**
 * This function serves as a switch for individual endpoint logic
 * which is determined by the "action" parameter in the requestData object.
 * @param {RequestData} requestData - Data sent from the client
 * @param {CallableContext} context - Context of the function, which holds authentication data
 * @return {Promise<unknown>} - Response data to be sent back to the client.
 */
async function main(requestData : RequestData, context : CallableContext) {
  // Check if action is specified
  if (!requestData.action) {
    throw new Error("Action not specified!");
  }

  // Since some endpoints do not require authentication, we will check for these first.
  const unauthenticatedResponse = await checkUnauthenticatedEndpoints(requestData, context);
  if (unauthenticatedResponse) {
    return unauthenticatedResponse;
  }

  if (!isAuthenticated(requestData, context)) {
    throw new Error("Authentication Required!");
  }

  const dataEncrypter = prepareDataEncrypter(requestData);

  // Check the authenticated endpoints
  if (requestData.action == ServerAction.initUser) {
    const answer = await userInitializer.main(requestData, context, prisma);
    return answer;
  }

  if (requestData.action == ServerAction.chatWithBot) {
    const answer = await chatBot.main(requestData);
    return answer;
  }

  if (requestData.action == ServerAction.newFeedback) {
    const answer = await feedbackManager.main(requestData, context, prisma);
    return answer;
  }

  if (requestData.action == ServerAction.deleteUser) {
    const answer = await userDeleter.main(context, prisma, adminImport);
    return answer;
  }

  if (requestData.action == ServerAction.updateUser) {
    const answer = await userUpdater.main(requestData, context, prisma);
    return answer;
  }

  if (requestData.action == ServerAction.manageGroup) {
    const answer = await groupManager.main(requestData, context, prisma, dataEncrypter!);
    return answer;
  }

  if (requestData.action == ServerAction.getDataPresets) {
    const answer = await datPresetGetter.main(requestData, context, prisma, dataEncrypter!);
    return answer;
  }

  if (requestData.action == ServerAction.updateDataPresets) {
    const answer = await datPresetUpdater.main(requestData, context, prisma, dataEncrypter!);
    return answer;
  }

  if (requestData.action == ServerAction.createContact) {
    const answer = await contactCreator.main(requestData, context, prisma, dataEncrypter!);
    return answer;
  }

  if (requestData.action == ServerAction.deleteContact) {
    const answer = await contactDeleter.main(requestData, context, prisma);
    return answer;
  }

  if (requestData.action == ServerAction.getContact) {
    const answer = await contactGetter.main(requestData, context, prisma, dataEncrypter!);
    return answer;
  }

  if (requestData.action == ServerAction.updateContact) {
    const answer = await contactUpdater.main(requestData, context, prisma, dataEncrypter!);
    return answer;
  }

  if (requestData.action == ServerAction.updateContactPicture) {
    const answer = await contactPictureUpdater.main(requestData, context, prisma);
    return answer;
  }

  if (requestData.action == ServerAction.manageImages) {
    const answer = await imageManager.main(requestData, context, dataEncrypter!, adminImport);
    return answer;
  }

  if (requestData.action == ServerAction.manageNotes) {
    const answer = await notesManager.main(requestData, context, prisma, dataEncrypter!);
    return answer;
  }

  if (requestData.action == ServerAction.checkVersion) {
    const answer = await versionCheck.main(prisma);
    return answer;
  }

  if (requestData.action == ServerAction.generateRecoveryCode) {
    const answer = await recoveryCodeGenerator.main(context, prisma, dataEncrypter!);
    return answer;
  }

  if (requestData.action == ServerAction.changePassword) {
    const answer = await passwordChanger.main(requestData, prisma, adminImport);
    return answer;
  }

  if (requestData.action == ServerAction.getNotifications) {
    const answer = await notificationGetter.main(requestData, context, prisma);
    return answer;
  }

  if (requestData.action == ServerAction.readNotification) {
    const answer = await notificationReader.main(requestData, context, prisma);
    return answer;
  }

  if (requestData.action == ServerAction.linkedInScrapper || requestData.action == ServerAction.googleSearchEngine || requestData.action == ServerAction.requestScrapingToken) {
    const answer = await scraper.main(requestData, context, prisma, dataEncrypter!);
    return answer;
  }

  if (requestData.action == ServerAction.getCredits) {
    const answer = await creditsGetter.main(context, prisma);
    return answer;
  }

  throw new Error("Unknown action: " + requestData.action);
}
