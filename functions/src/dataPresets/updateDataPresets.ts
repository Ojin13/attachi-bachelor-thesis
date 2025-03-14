import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";
import {DataEncrypter} from "../dataEncryption";

/**
 * This function updates the answer of a question as well as its dependencies in the database.
 * If no answer is provided, it will delete the answer.
 * If no answer is found, it will create a new one.
 * @param {RequestData} requestData - The data needed to update a question's answer
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @return {Promise<Object>} - The updated question answer data
 * @throws {Error} - If more data is needed to perform this operation
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient, dataEncrypter : DataEncrypter) {
  // Check if all needed data provied
  if (!requestData.contact_id || !requestData.id || (!requestData.answer && requestData.answer != "")) {
    throw new Error("More data needed to perform this operation!");
  }

  // Determine if answer already exists
  const answerExists = (requestData.answerID == undefined) ? false : true;

  let updatedDataPresetQuestion;

  /** ***********  Create Answer *************/
  if (answerExists == false) {
    // If wants to create record with empty answer, return
    if (requestData.answer == "") {
      return {};
    }

    let dependencies : any = null;

    if (requestData.dependencies) {
      dependencies = await setDependencies(requestData, context, prisma, dataEncrypter);
    }


    const query = {
      data: {
        contact_id: requestData.contact_id,
        question_id: requestData.id,
        question_answer: dataEncrypter.encryptData(requestData.answer),
        user_uid: context.auth!.uid,
      },
    };

    updatedDataPresetQuestion = await prisma.dataPresetAnswers.create(query);
    updatedDataPresetQuestion["new"] = true;
    updatedDataPresetQuestion.question_answer = dataEncrypter.decryptData(updatedDataPresetQuestion.question_answer);

    if (dependencies != null) {
      updatedDataPresetQuestion.dependencies = dependencies;
    }

    return updatedDataPresetQuestion;
  } else {
    /** ***********  Delete Answer *************/
    if (requestData.answer == "") {
      const query = {
        where: {
          id: requestData.answerID,
          user_uid: context.auth!.uid,
          contact_id: requestData.contact_id,
          question_id: requestData.id,
        },
      };

      const deletedContact = await prisma.dataPresetAnswers.delete(query);
      deletedContact["deleted"] = true;
      return deletedContact;
    }

    /** ***********  Update Answer *************/

    let dependencies : any = null;

    if (requestData.dependencies != undefined) {
      dependencies = await setDependencies(requestData, context, prisma, dataEncrypter);
    }


    const query = {
      where: {
        id: requestData.answerID,
        user_uid: context.auth!.uid,
        contact_id: requestData.contact_id,
        question_id: requestData.id,
      },
      data: {
        question_answer: dataEncrypter.encryptData(requestData.answer),
      },
    };

    updatedDataPresetQuestion = await prisma.dataPresetAnswers.update(query);
    updatedDataPresetQuestion["updated"] = true;
    updatedDataPresetQuestion.question_answer = dataEncrypter.decryptData(updatedDataPresetQuestion.question_answer);

    if (dependencies != null) {
      updatedDataPresetQuestion.dependencies = dependencies;
    }

    return updatedDataPresetQuestion;
  }
}


// If question X has dependent question Y and Y has it's own dependent question Z, then
// changing X will update Y which will update Z. If I update question Y, then it will update
// only question Z, not X. This means that dependencies updates only "child" questions, not parent questions.
async function setDependencies(requestData : RequestData, context : CallableContext, prisma : PrismaClient, dataEncrypter : DataEncrypter) {
  const updatedDependencies = {};
  const listOfDependencies: object[] = [];

  Object.values(requestData.dependencies).forEach(async (dependentQuestion : any) => {
    listOfDependencies.push(dependentQuestion);
  });


  // Loop through dependent questions, and set it's value in main()
  // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
  await Promise.all(listOfDependencies.map(async (dependentQuestion : any) => {
    if (dependentQuestion.answer) {
      await main(dependentQuestion, context, prisma, dataEncrypter)
          .then(async (res) => {
            updatedDependencies[dependentQuestion.id] = res;
          })
          .catch(async (e) => {
            updatedDependencies[dependentQuestion.id] = e.message;
          });
    }
  }));

  return updatedDependencies;
}
