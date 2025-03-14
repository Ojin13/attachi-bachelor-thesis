/**
 * This file contains all Typescript custom types, interfaces etc
 * used in the Firebase functions.
 */

export enum QuestionDataType {
    text = "text",
    number = "number",
    date = "date",
    bool = "bool",
    boolReverse = "boolReverse",
    select = "select",
    url = "url"
}

export enum ContactProperties {
    name = "name",
    desc = "desc",
}

export interface CreditData {
    credits: number;
    nextAutoRecharge: string;
}
export interface RequestData {
    action: string,
    encryptionKey? : string,
    [key: string]: any
}

export interface ResponseData {
    code: number,
    answer: unknown
}


export enum UploadType{
    contactImage = "contactImage",
    userProfilePicture = "userProfilePicture"
}

export enum YesNoValue {
    Yes = "Yes",
    No = "No",

    // This is used for the true/false values that are stored in the database
    // For example, boolean question have answer as true/false (retrieved from DB as string)
    true = "true",
    false = "false"
}


export enum VerifierType {
    OldPassword = "OldPassword",
    RecoveryCode = "RecoveryCode",
}

export enum ServerAction {
    checkUserExistence = "checkUserExistence",
    checkRecoveryCode = "checkRecoveryCode",
    changePassword = "changePassword",
    initUser = "initUser",
    chatWithBot = "chatWithBot",
    newFeedback = "newFeedback",
    deleteUser = "deleteUser",
    updateUser = "updateUser",
    manageGroup = "manageGroup",
    getDataPresets = "getDataPresets",
    updateDataPresets = "updateDataPresets",
    createContact = "createContact",
    deleteContact = "deleteContact",
    getContact = "getContact",
    updateContact = "updateContact",
    updateContactPicture = "updateContactPicture",
    manageImages = "manageImages",
    manageNotes = "manageNotes",
    checkVersion = "checkVersion",
    generateRecoveryCode = "generateRecoveryCode",
    getNotifications = "getNotifications",
    readNotification = "readNotification",
    linkedInScrapper = "linkedInScrapper",
    googleSearchEngine = "googleSearchEngine",
    requestScrapingToken = "requestScrapingToken",
    getCredits = "getCredits",
}

export interface DerivedKey {
    bytes: string,
    hex: string
}
