import {RequestData} from "../types";


/**
 * This function scrapes data from LinkedIn using the ProxyCurl API.
 * The function can get a profile picture from a LinkedIn profile URL,
 * get profile data from social networks by URL, or get profile data from social networks by name and company.
 * @param {RequestData} requestData - The data needed to scrape the data
 * @return {Promise<Object>} - The scraped data
 * @throws {Error} - If specific action is not provided
 */
export async function main(requestData : RequestData ) {
  const axios = require("axios");
  const apiKey = process.env.PROXYCURL_API_KEY;
  const authHeader = {"Authorization": "Bearer " + apiKey};


  if (requestData.specificAction == undefined) {
    throw new Error("Specific action not specified!");
  }

  // GET PROFILE PICTURE FROM LinkedIn
  // https://nubela.co/proxycurl/docs#people-api-person-profile-picture-endpoint
  if (requestData.specificAction == "getProfilePicture") {
    return await axios.get("https://nubela.co/proxycurl/api/linkedin/person/profile-picture", {
      params: {
        linkedin_person_profile_url: requestData.linkedinProfileUrl
      },
      headers: authHeader
    }).then(function(response) {
      return response.data.tmp_profile_pic_url;
    }).catch(function() {
      throw new Error("Profile picture not found!");
    });
  }

  // GET PROFILE DATA FROM SOCIAL NETWORKS BY social profile URL
  // https://nubela.co/proxycurl/docs?python#people-api-person-profile-endpoint
  if (requestData.specificAction == "getProfileDataByURL") {
    const requestParams = {
      skills: "include",
      use_cache: "if-recent",

      // extra: "include",
      // personal_email: "include",
      // personal_contact_number: "include",
      // github_profile_id: "include",
      // facebook_profile_id: "include",
      // twitter_profile_id: "include",
      // inferred_salary: "include",
    };

    // Define source of data
    if (requestData.linkedinProfileUrl != undefined) {
      requestParams["linkedin_profile_url"] = requestData.linkedinProfileUrl;
    }
    else if (requestData.facebookProfileUrl != undefined) {
      requestParams["facebook_profile_url"] = requestData.facebookProfileUrl;
    }
    else if (requestData.twitterProfileUrl != undefined) {
      requestParams["twitter_profile_url"] = requestData.twitterProfileUrl;
    } else {
      throw new Error("Profile URL not specified!");
    }


    return await axios.get("https://nubela.co/proxycurl/api/v2/linkedin", {
      params: requestParams,
      headers: authHeader
    }).then(function(response) {
      return response.data;
    }).catch(function() {
      throw new Error("Profile data not found by url!");
    });
  }

  // GET PROFILE DATA FROM SOCIAL NETWORKS by name and company
  if (requestData.specificAction == "getProfileDataByNameAndCompany") {
    return await axios.get("https://nubela.co/proxycurl/api/linkedin/profile/resolve", {
      params: {
        first_name: requestData.firstName,
        last_name: requestData.lastName,
        company_domain: requestData.company
      },
      headers: authHeader
    }).then(function(response) {
      return response.data;
    }).catch(function() {
      throw new Error("Profile data not found by name and company!");
    });
  }
}
