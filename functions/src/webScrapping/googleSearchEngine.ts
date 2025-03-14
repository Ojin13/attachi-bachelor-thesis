import {RequestData} from "../types";

/**
 * This function searches the web using Google Search Engine API
 * based on the search term and search engine type provided.
 * @param {RequestData} requestData - The data needed to search the web
 * @return {Promise<Object>} - The search results
 * @throws {Error} - If search data is not provided
 * 
 * For more information, check out the Programmable Google Search Engine documentation:
 * https://developers.google.com/custom-search/v1/using_rest
 */
export async function main(requestData : RequestData) {
  if (!requestData.searchTerm) {
    throw new Error("Search data not provide");
  }

  if (!requestData.searchEngineType) {
    throw new Error("Search engine type not provided!");
  }

  const axios = require("axios");
  const apiKey = process.env.GOOGLE_SEARCH_ENGINE_API_KEY;

  const searchEngineParams = {
    key: apiKey,
    cx: "*****************", // ArticlesAndNewsLookup
    q: requestData.searchTerm,
  };

  if (requestData.searchEngineType == "LinkedInLookup") {
    searchEngineParams.cx = "*****************";
  }

  if (requestData.searchEngineType == "InstagramLookup") {
    searchEngineParams.cx = "*****************";
  }

  if (requestData.searchEngineType == "WikipediaLookup") {
    searchEngineParams.cx = "*****************";
  }

  if (requestData.searchEngineType == "FacebookLookup") {
    searchEngineParams.cx = "*****************";
  }

  if (requestData.searchEngineType == "TwitterLookup") {
    searchEngineParams.cx = "*****************";
  }

  if (requestData.searchEngineType == "YoutubeLookup") {
    searchEngineParams.cx = "*****************";
  }

  if (requestData.searchEngineType == "OtherSocialNetworksLookup") {
    searchEngineParams.cx = "*****************";
  }


  return await axios.get("https://www.googleapis.com/customsearch/v1?", {
    params: searchEngineParams
  }).then(function(response) {
    return response.data;
  }).catch(function() {
    throw new Error("Profile picture not found!");
  });
}
