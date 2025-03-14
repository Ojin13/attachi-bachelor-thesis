import type { ScrapedItem, ScrapedData, Contact, GuessedSchoolTypes } from "~/types";
import { YesNoValue, SaveAsType } from "~/types";

/**
 * Composable function that maps data received from Proxycurl API to ScrapedItem objects
 * that have structured data and are mapped to the corresponding questions.
 *
 * See https://nubela.co/proxycurl/docs#people-api
 * for proxyCurlData structure and documentation.
 *
 * @param contactBasicInfo Contact object with basic information about the contact
 * @param mappedData ScrapedData object that will hold the mapped data from Proxycurl
 */
export function useProxycurlMapper(contactBasicInfo: Ref<Contact>, mappedData: ScrapedData) {
    /**
     * This function maps the response from Proxycurl People API to array
     * of ScrapedItem objects.
     * @param proxyCurlData Raw response from Proxycurl People API
     * @returns Array of ScrapedItem objects
     */
    const mapProxyCurlData = (proxyCurlData: any): ScrapedItem[] => {
        const proxycurlMappedData: ScrapedItem[] = [];

        Object.keys(proxyCurlData).forEach((key) => {
            const value = proxyCurlData[key];

            if (!value || (Array.isArray(value) && value.length == 0)) {
                return;
            }

            switch (key) {
                case "public_identifier":
                    // Save to "LinkedIn" (100)
                    proxycurlMappedData.push(createScrapedItem("LinkedIn profile URL", "https://www.linkedin.com/in/" + value, "LinkedIn", SaveAsType.question, 100, true));
                    mappedData.socials.linkedin = value;
                    break;
                case "profile_pic_url":
                    // Save LinkedIn profile picture
                    mappedData.linkedInProfilePicture = value;
                    break;
                case "background_cover_image_url":
                    // Save LinkedIn background image
                    mappedData.backgroundImage = value;
                    break;
                case "first_name":
                    // Save as first name of the contact
                    mappedData.firstName = value;
                    break;
                case "last_name":
                    // Save as last name of the contact
                    mappedData.lastName = value;
                    break;
                case "follower_count":
                    // Save as a note
                    proxycurlMappedData.push(
                        createScrapedItem(
                            "Number of LinkedIn follower and connection",
                            "LinkedIn followers: " + value + "\n" + "LinkedIn connections: " + proxyCurlData["connections"],
                            "LinkedIn",
                            SaveAsType.note,
                        ),
                    );
                    break;
                case "occupation":
                    // Save to "Current position" (20)
                    proxycurlMappedData.push(createScrapedItem("Current occupation", value, "LinkedIn", SaveAsType.question, 20));
                    break;
                case "headline":
                    // Save to contact description
                    proxycurlMappedData.push(createScrapedItem("Motto or bio", value, "LinkedIn", SaveAsType.contactDescription));
                    break;
                case "summary":
                    // Save to contact description
                    proxycurlMappedData.push(createScrapedItem("Short self-description", value, "LinkedIn", SaveAsType.contactDescription));
                    break;
                case "country_full_name":
                    // Save to "Nationality" (64)
                    proxycurlMappedData.push(createScrapedItem("Country of origin", value, "LinkedIn", SaveAsType.question, 64));
                    break;
                case "city":
                    // Save to "Address" (4)
                    proxycurlMappedData.push(createScrapedItem("City this person is from", value, "LinkedIn", SaveAsType.question, 4));
                    break;
                case "state":
                    // Save to "Address" (4)
                    proxycurlMappedData.push(createScrapedItem("State this person is from", value, "LinkedIn", SaveAsType.question, 4));
                    break;
                case "experiences":
                    // Save to "Previous working experiences" (101)
                    proxycurlMappedData.push(createScrapedItem("Professional experiences", formatLinkedinExperiences(value), "LinkedIn", SaveAsType.question, 101));

                    // Save to "Currently works in" (19)
                    const currentCompanies = formatCurrentCompanies(value);
                    if (currentCompanies != "") {
                        proxycurlMappedData.push(createScrapedItem("Currently works in", currentCompanies, "LinkedIn", SaveAsType.question, 19));

                        // Save to "Is employed" (18)
                        proxycurlMappedData.push(createScrapedItem("Is employed", YesNoValue.true, "LinkedIn", SaveAsType.question, 18, false, true));
                    }
                    break;
                case "education":
                    // Try to guess school types
                    const schoolTypes = guessSchoolTypes(value);

                    // Save to "University" (15)
                    if (schoolTypes.university.length > 0) {
                        proxycurlMappedData.push(createScrapedItem("University", formatLinkedinEducation(schoolTypes.university), "LinkedIn", SaveAsType.question, 15));
                    }

                    // Save to "High school" (14)
                    if (schoolTypes.highschool.length > 0) {
                        proxycurlMappedData.push(createScrapedItem("High school", formatLinkedinEducation(schoolTypes.highschool), "LinkedIn", SaveAsType.question, 14));
                    }

                    // Save to "Elementary school" (13)
                    if (schoolTypes.elementary.length > 0) {
                        proxycurlMappedData.push(createScrapedItem("Elementary school", formatLinkedinEducation(schoolTypes.elementary), "LinkedIn", SaveAsType.question, 13));
                    }

                    // Save to "Other education" (102)
                    if (schoolTypes.other.length > 0) {
                        proxycurlMappedData.push(createScrapedItem("Other education", formatLinkedinEducation(schoolTypes.other), "LinkedIn", SaveAsType.question, 102));
                    }
                    break;
                case "languages":
                    // Save to "Speaks languages" (68)
                    proxycurlMappedData.push(createScrapedItem("Speaks languages", value.join(", "), "LinkedIn", SaveAsType.question, 68));
                    break;
                case "certifications":
                    // Save to "Certifications" (103)
                    proxycurlMappedData.push(createScrapedItem("Certifications", formatCertifications(value), "LinkedIn", SaveAsType.question, 103));
                    break;
                case "people_also_viewed":
                    // Save to similar profiles
                    mappedData.similarPeople = mappedData.similarPeople.concat(value);
                    break;
                case "recommendations":
                    // Save to notes
                    proxycurlMappedData.push(createScrapedItem("References made by connections of " + contactBasicInfo.value.name, value.join("\n "), "LinkedIn", SaveAsType.note));
                    break;
                case "similarly_named_profiles":
                    // Save to similar profiles
                    mappedData.similarPeople = mappedData.similarPeople.concat(value);
                    break;
                case "articles":
                    // Save to notes
                    proxycurlMappedData.push(createScrapedItem("Articles written by " + contactBasicInfo.value.name, formatLinkedinArticles(value), "LinkedIn", SaveAsType.note));
                    break;
                case "groups":
                    // Save to notes
                    proxycurlMappedData.push(createScrapedItem("LinkedIn groups", formatLinkedinGroups(value), "LinkedIn", SaveAsType.note));
                    break;
                case "inferred_salary":
                    // Save to "Salary" (21)
                    const range = value.min + " - " + value.max + "$ per year";
                    proxycurlMappedData.push(createScrapedItem("Inferred salary/year (US)", range, "LinkedIn", SaveAsType.question, 21));
                    break;
                case "gender":
                    // Save to "Gender" (7)
                    // Proxycurl returns lowercase but select values in the app have first letter capitalized
                    let capitalizedGender = value.charAt(0).toUpperCase() + value.slice(1);
                    if (value != "male" || value != "female") {
                        capitalizedGender = "Other";
                    }
                    proxycurlMappedData.push(createScrapedItem("Gender", capitalizedGender, "LinkedIn", SaveAsType.question, 7));
                    break;
                case "birth_date":
                    // Save to "Birth date" (1)
                    proxycurlMappedData.push(createScrapedItem("Date of birth", value.day + "/" + value.month + "/" + value.year, "LinkedIn", SaveAsType.question, 1));
                    break;
                case "industry":
                    // Save to "Industry" (62)
                    proxycurlMappedData.push(createScrapedItem("Industry", value, "LinkedIn", SaveAsType.question, 62));
                    break;
                case "extra":
                    // Save to notes
                    if (value.github_profile_id) {
                        proxycurlMappedData.push(createScrapedItem("GitHub account", "https://github.com/" + value, "LinkedIn", SaveAsType.note));
                    }

                    // Save to "Facebook" (40)
                    if (value.facebook_profile_id) {
                        proxycurlMappedData.push(createScrapedItem("Facebook account", "https://facebook.com/" + value, "LinkedIn", SaveAsType.question, 40, true));
                    }

                    // Save to "Twitter" (43)
                    if (value.twitter_profile_id) {
                        proxycurlMappedData.push(createScrapedItem("Twitter account", "https://twitter.com/" + value, "LinkedIn", SaveAsType.question, 43, true));
                    }

                    break;
                case "interests":
                    // Save to notes
                    proxycurlMappedData.push(createScrapedItem("Generel interests", value.join(", "), "LinkedIn", SaveAsType.note));
                    break;
                case "personal_emails":
                    // Save to "Email adress" (41)
                    proxycurlMappedData.push(createScrapedItem("Known email addresses", value.join("\n"), "LinkedIn", SaveAsType.question, 41));
                    break;
                case "personal_numbers":
                    // Save to "Phone number" (97)
                    proxycurlMappedData.push(createScrapedItem("Known phone numbers", value.join("\n"), "LinkedIn", SaveAsType.question, 97));
                    break;
                case "skills":
                    // Save to "Skills and abilities" (94)
                    proxycurlMappedData.push(createScrapedItem("Skills", value.join(", "), "LinkedIn", SaveAsType.question, 94));
                    break;
            }
        });

        return proxycurlMappedData;
    };

    /**
     * This function takes LinkedIn groups and formats them to a readable string
     * @param linkedInGroupsObject LinkedIn groups from proxycurl response
     * @returns Formated string with LinkedIn groups
     */
    const formatLinkedinGroups = (linkedInGroupsObject: any): string => {
        let formattedGroups = "Member of the following LinkedIn groups: \n\n";

        linkedInGroupsObject.forEach((group: any) => {
            formattedGroups += "• " + group.name + "\n";
            if (group.url) {
                formattedGroups += "URL: " + group.url + "\n\n";
            }
        });

        return formattedGroups;
    };

    /**
     * This function takes LinkedIn articles and formats them to a readable string
     * @param linkedInArticlesObject LinkedIn articles from proxycurl response
     * @returns Formated string with LinkedIn articles
     */
    const formatLinkedinArticles = (linkedInArticlesObject: any): string => {
        let formattedArticles = "Published articles: \n\n";

        linkedInArticlesObject.forEach((article: any) => {
            formattedArticles += "• " + article.title + " by " + article.author + " on " + formatDateRange(article.published_date) + "\n";

            if (article.url) {
                formattedArticles += "URL: " + article.link + "\n\n";
            }
        });

        return formattedArticles;
    };

    /**
     * This function takes certifications and formats them to a readable string
     * @param linkedInCertificationsObject LinkedIn certifications from proxycurl response
     * @returns Formated string with certifications
     */
    const formatCertifications = (linkedInCertificationsObject: any): string => {
        let formattedCertifications = "";

        linkedInCertificationsObject.forEach((certification: any) => {
            formattedCertifications += "• " + certification.name;

            if (certification.authority) {
                formattedCertifications += " by " + certification.authority;
            }

            formattedCertifications += "Validity of the certification: " + formatDateRange(certification) + "\n";

            if (certification.license_number) {
                formattedCertifications += "License number: " + certification.license_number + "\n";
            }

            if (certification.url) {
                formattedCertifications += "Certification URL: " + certification.url + "\n\n";
            }
        });

        return formattedCertifications;
    };

    /**
     * This function tries to determine the type/level of school based on the name of the school
     * @param linkedInEducationObject LinkedIn education from proxycurl response
     * @returns Object with school types as keys and array of experiences as values
     */
    const guessSchoolTypes = (linkedInEducationObject: any): GuessedSchoolTypes => {
        let schoolTypes: GuessedSchoolTypes = {
            university: [],
            highschool: [],
            elementary: [],
            other: [],
        };

        // List of indentifiers for each school type
        const universityIdentifiers = ["universi", "univerzi", "college", "faculty"];
        const highschoolIdentifiers = ["high school", "lyceum", "gymnasium", "secondary"];
        const elementaryIdentifiers = ["elementary", "primary"];

        // Loops through each experience and tries to determine the type of school
        // based on the name of the school
        linkedInEducationObject.forEach((experience: any) => {
            let identifierFound = false;
            const schoolName = experience.school.toLowerCase();

            if (!identifierFound) {
                universityIdentifiers.forEach((identifier) => {
                    if (schoolName.includes(identifier)) {
                        identifierFound = true;
                        schoolTypes.university.push(experience);
                    }
                });
            }

            if (!identifierFound) {
                highschoolIdentifiers.forEach((identifier) => {
                    if (schoolName.includes(identifier)) {
                        identifierFound = true;
                        schoolTypes.highschool.push(experience);
                    }
                });
            }

            if (!identifierFound) {
                elementaryIdentifiers.forEach((identifier) => {
                    if (schoolName.includes(identifier)) {
                        identifierFound = true;
                        schoolTypes.elementary.push(experience);
                    }
                });
            }

            if (!identifierFound) {
                schoolTypes.other.push(experience);
            }
        });

        return schoolTypes;
    };

    /**
     * This function takes LinkedIn education and formats them to a readable string
     * @param linkedInEducationObject LinkedIn education from proxycurl response
     * @returns Formated string with LinkedIn education (achieved degrees etc)
     */
    const formatLinkedinEducation = (linkedInEducationObject: any): string => {
        let formattedEducation = "";

        linkedInEducationObject.forEach((experience: any) => {
            formattedEducation += "• " + experience.school;

            if (experience.degree_name) {
                formattedEducation += experience.degree_name;
            }

            if (experience.field_of_study) {
                formattedEducation += " | " + experience.field_of_study;
            }

            formattedEducation += formatDateRange(experience) + "\n";

            if (experience.description) {
                formattedEducation += contactBasicInfo.value.name + " description of this experience: " + experience.description + "\n\n";
            }
        });

        return formattedEducation;
    };

    /**
     * This function takes LinkedIn experiences and formats them to a readable string.
     * Determines which companies the contact is currently working at based on the end date of the experience.
     * @param linkedInExperiencesObject LinkedIn experiences from proxycurl response
     * @returns Formated string with current working positions of the contact
     */
    const formatCurrentCompanies = (linkedInExperiencesObject: any): string => {
        let formattedCurrentCompanies = "";

        linkedInExperiencesObject.forEach((experience: any) => {
            if (!experience.ends_at) {
                formattedCurrentCompanies += "• " + experience.company;
                if (experience.location) {
                    formattedCurrentCompanies += " in " + experience.location;
                }
                formattedCurrentCompanies += "\n";
            }
        });

        return formattedCurrentCompanies;
    };

    /**
     * This function takes LinkedIn experiences and formats them to a readable string
     * @param experiences LinkedIn experiences from proxycurl response
     * @returns Formated string with all LinkedIn experiences
     */
    const formatLinkedinExperiences = (linkedInExperiencesObject: any): string => {
        let formattedExperiences = "";
        linkedInExperiencesObject.forEach((experience: any) => {
            formattedExperiences += "• " + experience.title + " at " + experience.company;

            if (experience.location) {
                formattedExperiences += " in " + experience.location;
            }

            formattedExperiences += formatDateRange(experience) + "\n\n";
        });

        return formattedExperiences;
    };

    /**
     * This is a helper function that formats the Proxycurl date object to a readable string
     * @param experience Proxycurl date object with start and end date
     * @returns Formated string with date range of the experience
     */
    const formatDateRange = (experience: any): string => {
        let formattedDateRange = "";

        if (experience.starts_at) {
            formattedDateRange += " (" + formatProxyCurlDateObject(experience.starts_at) + " - ";
        } else {
            formattedDateRange += " ( unknown start date - ";
        }

        if (experience.ends_at) {
            formattedDateRange += formatProxyCurlDateObject(experience.ends_at) + ")";
        } else {
            formattedDateRange += "present)";
        }

        return formattedDateRange;
    };

    /**
     * This is a helper function that formats the Proxycurl date object to a readable string
     * @param date Proxycurl date object
     * @returns Formated string with date (not range, but only date itself)
     */
    const formatProxyCurlDateObject = (date: any): string => {
        let day = date.day;
        let month = date.month - 1;
        let year = date.year;
        const dateObject = new Date(year, month, day);

        return formatTimestamp(dateObject.getTime() / 1000, false);
    };

    /**
     * This is a helper funnction that creates and returns a ScrapedItem object
     * based on the provided parameters
     * @param name Name of the ScrapedItem
     * @param value Value of the ScrapedItem
     * @param source Value of the ScrapedItem (like Google, LinkedIn etc.)
     * @param saveAsType Type of the ScrapedItem - SaveAsType (contactDescription, question, note)
     * @param questionID ID of the question that the ScrapedItem is mapped to
     * @param isURL Determines if the value is URL
     * @param isTrueFalseItem Determines if the value is boolean
     * @returns New ScrapedItem object
     */
    const createScrapedItem = (name: string, value: string, source: string, saveAsType: SaveAsType, questionID?: number, isURL?: boolean, isTrueFalseItem?: boolean): ScrapedItem => {
        const newItem: ScrapedItem = {
            name: name,
            value: value,
            source: source,
            saveAsType: saveAsType,
            questionID: questionID,
            isTrueFalseItem: false,
        };

        if (questionID) {
            newItem.questionID = questionID;
        }

        if (isURL) {
            newItem.isURL = isURL;
        }

        if (isTrueFalseItem) {
            newItem.isTrueFalseItem = isTrueFalseItem;
        }

        return newItem;
    };

    /**
     * This function takes Proxycurl People API response object and pretifies
     * all its keys that have any value. These prettied keys are then used in
     * ScrapingStepsVisualizer component to indicate progess of the scraping.
     * @param data Response object from Proxycurl People API
     * @returns Array of pretified keys
     */
    const pretifyObjectKeys = (data: any): string[] => {
        const prettyfiedKeysArray: string[] = [];

        Object.keys(data).forEach((key) => {
            // Dont pretify keys with no value
            let currentValue = data[key];
            if (!currentValue || Object.keys(currentValue).length == 0 || (Array.isArray(currentValue) && currentValue.length == 0)) {
                return;
            }

            let prettyKey = "";

            switch (key) {
                case "public_identifier":
                    prettyKey = "LinkedIn profile URL";
                    break;
                case "profile_pic_url":
                    prettyKey = "Profile picture";
                    break;
                case "background_cover_image_url":
                    prettyKey = "Background image";
                    break;
                case "first_name":
                    prettyKey = "First name";
                    break;
                case "last_name":
                    prettyKey = "Last name";
                    break;
                case "full_name":
                    prettyKey = "Full name";
                    break;
                case "follower_count":
                    prettyKey = "Number of followers on LinkedIn";
                    break;
                case "occupation":
                    prettyKey = "Occupation";
                    break;
                case "headline":
                    prettyKey = "Motto or bio";
                    break;
                case "summary":
                    prettyKey = "Short self-description";
                    break;
                case "country_full_name":
                    prettyKey = "Country";
                    break;
                case "city":
                    prettyKey = "City";
                    break;
                case "state":
                    prettyKey = "State";
                    break;
                case "experiences":
                    prettyKey = "Professional experiences";
                    break;
                case "education":
                    prettyKey = "Achieved education";
                    break;
                case "languages":
                    prettyKey = "Speaks languages";
                    break;
                case "certifications":
                    prettyKey = "Certifications";
                    break;
                case "connections":
                    prettyKey = "Number of LinkedIn connections";
                    break;
                case "people_also_viewed":
                    prettyKey = "Similar people";
                    break;
                case "recommendations":
                    prettyKey = "Given recommendations";
                    break;
                case "similarly_named_profiles":
                    prettyKey = "Profiles with similar name";
                    break;
                case "articles":
                    prettyKey = "Published articles";
                    break;
                case "groups":
                    prettyKey = "LinkedIn groups";
                    break;
                case "skills":
                    prettyKey = "Skills";
                    break;
                case "inferred_salary":
                    prettyKey = "Estimated salary range";
                    break;
                case "gender":
                    prettyKey = "Proclaimed gender";
                    break;
                case " birth_date":
                    prettyKey = "Birth date";
                    break;
                case "industry":
                    prettyKey = "Current industry";
                    break;
                case "interests":
                    prettyKey = "Generel interests";
                    break;
                case "personal_emails":
                    prettyKey = "Known email addresses";
                    break;
                case "personal_numbers":
                    prettyKey = "Known phone numbers";
                    break;
                default:
                    prettyKey = "";
            }

            if (prettyKey) {
                prettyfiedKeysArray.push(prettyKey);
            }
        });

        return prettyfiedKeysArray;
    };

    return { mapProxyCurlData, pretifyObjectKeys };
}
