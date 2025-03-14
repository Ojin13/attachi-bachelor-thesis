import {Configuration, OpenAIApi} from "openai";
import {RequestData} from "../types";

/**
 * Chatbot function that uses OpenAI's GPT-3.5 model to generate a response to a given prompt.
 * @param {RequestData} requestData - The prompt to generate a response to
 * @return {Promise<string>} - The generated response
 * @throws {Error} - If an error occurs while generating the response
 */
export async function main(requestData : RequestData) {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });

    const openai = new OpenAIApi(configuration);
    const systemPrompt = "You are a personal psychologist. You will be given a list of information about a person and a question about this person. You will use the provided information to answer the question. Always say something new about this person using interference. If you are not sure, try to say it anyway. If you are asked to generate a report about a person, then create a complete report containing everything you know about this person and include some extra related information that you can deduce from the provided information in the same way as Detective Sherlock Holmes.";

    const response = await openai.createChatCompletion({
      "model": "gpt-3.5-turbo-0125",
      "temperature": 1,
      "messages": [
        {role: "system", content: systemPrompt},
        {role: "user", content: requestData.prompt}],
    });

    return response.data.choices[0].message;
  } catch (e) {
    return e;
  }
}
