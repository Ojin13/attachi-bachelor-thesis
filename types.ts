/**
 * This file contains all Typescript custom types, interfaces etc
 * used in the application. Import individual types as needed.
 */




// **************************
// * Types related to Contacts
// **************************


export interface ContactNote {
    id: number,
    text: string,
    lastUpdateDate: string,
}

export interface ContactPicture {
    media_name: string,
    url: string,
}

export interface Contact{
    id: number,
    userUID: string,
    name: string,
    description: string,
    pictures: ContactPicture[],
    profilePic?: ContactPicture
}

export enum QuestionDataType {
    text = "text",
    number = "number",
    date = "date",
    bool = "bool",
    boolReverse = "boolReverse",
    select = "select",
    url = "url"
}

export interface Question {
    id: number,
    questionText: string,
    questionDataType: QuestionDataType,
    dependentQuestionIDs?: number[],
    dependencies?: {
        [questionID: string]: Question
    },
    parentQuestionID: number,
    answer?: string,
    contact_id?: number,
    answerID?: number,
}
export interface DataPreset {
    id: number,
    name: string,
    description: string,
    questions: Question[]
}


export interface ContactGroup {
    groupName: string,
    groupDesc: string,
    groupId: string,
    isSmartGroup: boolean,
    codeName: string,
    groupMembers: Number[]
}


export interface DataPresetsOfAllContacts {
    [id: string]: DataPreset[]
}

export interface ContactIDsGroupedByAnswers {
    [questionID: string]: {
        [answer: string]: number[]
    }
}

export interface DependentQuestions{
    [questionID: string]: Question
}

export interface DataPresetUpdatePayload {
    question: Question,
    dependencies: DependentQuestions
}

export interface UpdatedAnswer {
    id: number,
    contact_id: number,
    question_id: number,
    question_answer: string,
    user_uid: string
    dependencies?: {
        [questionID: string]: UpdatedAnswer
    },
    new?: boolean
    updated?: boolean
    deleted?: boolean
}

export interface UpdatedAnswers {
    [questionID: string]: UpdatedAnswer
}



export enum ContactProperties {
    name = "name",
    desc = "desc",
}

export interface SlideData {
    slideIndex: number,
    isProfilePic: boolean
}












// **************************
// * Types for Scraping
// **************************

export enum SaveAsType {
    contactDescription = "contactDescription",
    question = "question",
    note = "note"
  }

export interface SocialNetworks {
    facebook?: string,
    instagram?: string,
    linkedin?: string,
    reddit?: string,
    twitter?: string,
    wikipedia?: string,
    youtube?: string,
    personalWebsite?: string,
    email?: string,
    phone?: string,
    discord?: string,
    pinterest?: string,
    snapchat?: string,
    tiktok?: string,
    quora?: string
}


export interface ScrapedItem {
    name: string,
    value: string,
    source: string,
    saveAsType: SaveAsType,
    questionID?: number,
    previewImage?: string,
    isURL?: boolean,
    isTrueFalseItem?: boolean
  }
  
  export interface ScrapedWebsite {
    summary: string,
    title: string,
    link: string,
    displayLink: string,
    source: string,
    saveAsType: SaveAsType,
    previewImage?: string,
    isFile?: boolean,
    fileExtension?: string,
    questionID?: number,
  }
  

  
  export interface ScrapedData {
    websites: ScrapedWebsite[]
    data: ScrapedItem[],
    otherImages: string[]
    backgroundImage?: string
    linkedInProfilePicture?: string
    similarPeople: any[]
    firstName?: string
    lastName?: string
    socials: SocialNetworks,
    summaryByAI?: string,
    files: ScrapedWebsite[],
    nicknameResults: ScrapedWebsite[],
  
    instagramProfiles: ScrapedWebsite[],
    facebookProfiles: ScrapedWebsite[],
    twitterProfiles: ScrapedWebsite[],
    youtubeProfiles: ScrapedWebsite[]
    
  
    redditProfiles: ScrapedWebsite[],
    pinterestProfiles: ScrapedWebsite[],
    tiktokProfiles: ScrapedWebsite[],
    snapchatProfiles: ScrapedWebsite[],
    quoaraProfiles: ScrapedWebsite[],
  }
  
  export interface RawScrapedData {
    googleSearch?: any,
    proxyCurl?: any,
    fileSearch?: any,
    instagram?: any,
    facebook?: any,
    twitter?: any,
    youtube?: any,
    otherSocials?: any,
    nicknameData?: any
  }

export interface ListOfSocialsQuestions {
    questionID: number,
    type: string
}

export interface PersonalWebsiteGuess {
    url: string,
    confidence: number
}


export interface ProfileForConfirmation {
    title?: string,
    link?: string,
    image?: string | null
}









// **************************
// * Types related to User
// **************************

export interface LoginData {
    email: string;
    password: string;
    name: string;
}


export interface User {
    encryptionKey: string;
    hasRecoveryCode: string;
}

export interface EncryptionKeys {
    encryptionKey: string;
}











// **************************
// * Other general types
// **************************

export interface RequestData {
    action?: string,
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


export interface ImageUpload {
    specificAction: string;
    imageName: string;
    uploadType: UploadType;
    doNotEncrypt: boolean;
    contactID: string;
    imageSource: string | ArrayBuffer;
}

export interface RouterLocation {
    path: string;
    query?: Object
}

export interface LinkType {
    url: string,
    type?: string
}

export interface ZodiacSigns {
    [key: string]: string
  }

export enum PasscodeStatus {
    userHasPasscode = "userHasPasscode",
    userHasNoPasscode = "userHasNoPasscode",
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

export interface NewPasswordVerifier {
    verifirerType: VerifierType,
    verifier: string,
    email: string,
    plaintextPassword?: string
    newPassword: string,
    action: string
}

export interface ChatMessage {
    id: string,
    question_id: number,
    text: string,
    isMyMessage: boolean,
    timeSent: string,
    isFirstBotMessage?: boolean,
    restOfMessages?: string[],
    isCustomMessage?: boolean
}
export interface GuessedSchoolTypes {
    university: string[],
    highschool: string[],
    elementary: string[],
    other: string[]
}


export interface PremadePrompt{
    id: number,
    text: string,
    desc: string,
    needed_questions: number[],
    answered: boolean,
    includeNotes: boolean
}

export interface AllPremadePrompts{
    [id: string]: PremadePrompt
}

export enum DataTypeForPrompt {
    individualInformation = "individualInformation",
    websites = "websites",
}


export interface NavigationStack {
    stack: string[],
    commit: string
    route: string
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
