import {CallableContext} from "firebase-functions/v1/https";
import {QuestionDataType, ServerAction, RequestData} from "../types";
import {PrismaClient} from "@prisma/client";
import {DataEncrypter} from "../dataEncryption";
import * as notesManager from "../quickNotes/notesManager";


/**
 * This function returns all data presets for a contact in the database based on the contact id provided.
 * Also formats all retrieved data presets to single JSON object.
 * @param {RequestData} requestData - The data needed to get data presets
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @return {Promise<Object>} - The data presets data
 * @throws {Error} - If contact id is not provided 
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient, dataEncrypter : DataEncrypter) {
  // Check if all needed data provied
  if (!requestData.contact_id) {
    throw new Error("More data needed to perform this operation!");
  }

  const query = {
    include: {
      dataPresetQuestionLinks: {
        include: {
          dataPresetQuestions: {
            include: {
              dataPresetAnswers: {
                where: {
                  contact_id: requestData.contact_id,
                  user_uid: context.auth!.uid,
                },
              },
              dataPresetsPremadeAnswers: {

              },
              dataPresetDependencies: {

              },
            },
          },
        },
      },
    },
  };

  const dataPresets = await prisma.dataPresets.findMany(query);

  const jsonData = {};
  dataPresets.forEach(function(dataPreset) {
    jsonData[dataPreset.id] =
    {
      id: dataPreset.id,
      name: dataPreset.name,
      description: dataPreset.description,
      questions: formatQuestionsJSON(dataPreset.dataPresetQuestionLinks, dataEncrypter),
    };
  });

  // Append notes to the data presets if requested
  if (requestData.appendNotes == true) {
    const notesRequestData = {
      contact_id: requestData.contact_id,
      action: ServerAction.manageNotes,
      specificAction: "getNotes"
    };
  
    jsonData["notes"] = await notesManager.main(notesRequestData, context, prisma, dataEncrypter);
  }
  
  return jsonData;
}


function formatQuestionsJSON(questions, dataEncrypter) {
  const jsonData = {};
  questions.forEach(function(question) {
    jsonData[question.question_id] =
    {
      id: question.question_id,
      questionText: question.dataPresetQuestions.question_text,
      questionDataType: question.dataPresetQuestions.data_type,
    };

    // If has any dependencies
    const dependencies = question.dataPresetQuestions.dataPresetDependencies;
    if (dependencies.length >= 1) {
      jsonData[question.question_id]["dependentQuestionIDs"] = formatDependentQuestionIds(dependencies);
    }

    // Answer field must be initialized even if answer doesnt exist yet. Otherwise vue v-model wont
    // detect change when answer field is added!
    jsonData[question.question_id]["answer"] = "";
    // If has answer include it
    if (formatAnswersIDJSON(question.dataPresetQuestions.dataPresetAnswers) != "") {
      jsonData[question.question_id]["answer"] = formatAnswersJSON(question.dataPresetQuestions.dataPresetAnswers, dataEncrypter);
      jsonData[question.question_id]["answerID"] = formatAnswersIDJSON(question.dataPresetQuestions.dataPresetAnswers);
    }

    // If has parent question include it
    if (question.dataPresetQuestions.parentQuestionID != 0) {
      jsonData[question.question_id]["parentQuestionID"] = question.dataPresetQuestions.parent_question_id;
    }

    // If is select type of question include possible answers
    if (question.dataPresetQuestions.data_type == QuestionDataType.select) {
      jsonData[question.question_id]["possible_answers"] = formatPosibleAnswersJSON(question.dataPresetQuestions.dataPresetsPremadeAnswers);
    }
  });

  return jsonData;
}


function formatAnswersJSON(answers, dataEncrypter) {
  if (answers.length >= 1) {
    return dataEncrypter.decryptData(answers[0].question_answer);
  }

  return "";
}


function formatAnswersIDJSON(answers) {
  if (answers.length >= 1) {
    return answers[0].id;
  }

  return "";
}


function formatPosibleAnswersJSON(answers) {
  const jsonData : string[] = [];
  answers.forEach(function(answer) {
    jsonData.push(answer.answer);
  });

  return jsonData;
}

function formatDependentQuestionIds(dependencies) {
  const jsonData : string[] = [];
  dependencies.forEach(function(dependency) {
    jsonData.push(dependency.dependent_question_id);
  });

  return jsonData;
}
