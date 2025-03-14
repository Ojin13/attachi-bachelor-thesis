import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "./types";
import {DataEncrypter} from "./dataEncryption";

const sharp = require("sharp");

/**
 * This function manages the images for the user.
 * It can upload an image, fetch an image, or delete an image.
 * It also optimizes the image with sharp before uploading it.
 * @param {RequestData} requestData - The data needed to manage the images
 * @param {CallableContext} context - The context of the request
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @param {any} adminImport - The admin object used to interact with Firebase services
 * @return {Promise<string>} - A message indicating the image has been uploaded, fetched, or deleted
 * @throws {Error} - If action is not supported or more data is needed to perform this operation
 */
export async function main(requestData : RequestData, context : CallableContext, dataEncrypter : DataEncrypter, adminImport) {
  // Check if action is specified
  if (!requestData.specificAction) {
    throw new Error("Action not specified!");
  }

  // UPLOAD IMAGE
  if (requestData.specificAction == "uploadImage") {
    if (!requestData.imageSource || !requestData.imageName || !requestData.uploadType) {
      throw new Error("More data needed to perform this operation!");
    }

    const axios = require("axios");

    // Check if imageSource is an HTTP link that needs to be fetched
    if (requestData.imageSource.startsWith("http")) {
      try {
        // Fetch the image as a stream
        const response = await axios.get(requestData.imageSource, {
          responseType: "arraybuffer" // Important to handle binary data correctly
        });

        // Convert the ArrayBuffer to a Buffer
        const buffer = Buffer.from(response.data, "binary");

        // Convert the buffer to a Base64 string
        requestData.imageSource = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      } catch (error) {
        console.error("Error fetching the image:", error);
      }
    }


    // Set upload location
    let uploadLocation = "users/"+context.auth!.uid+"/images/";

    if (requestData.uploadType == "contactImage") {
      if (requestData.contactID == undefined) {
        throw new Error("More data needed to perform this operation!");
      } else {
        uploadLocation += "contacts/"+requestData.contactID+"/";
      }
    } else if (requestData.uploadType == "userProfilePicture") {
      uploadLocation += "profilePicture/";
    } else {
      throw new Error("Unknown upload type!");
    }

    // Resize image with sharp and return it as base64 string
    const resizedImage = await optimizeImage(requestData.imageSource);
    let finalImage = "";

    // Encrypt resized image
    if (requestData.doNotEncrypt == true) {
      finalImage = resizedImage;
    } else {
      finalImage = dataEncrypter.encryptData(resizedImage);
    }

    // Upload image to storage
    await uploadFileToStorage(finalImage, uploadLocation, requestData.imageName, adminImport);
    return "Image uploaded successfully.";
  }


  // FETCH IMAGES
  if (requestData.specificAction == "fetchImage") {
    if (requestData.whatToFetch == undefined) {
      throw new Error("More data needed to perform this operation!");
    }

    // Set download location
    let downloadLocation = "";

    if (requestData.whatToFetch == "contactImages" || requestData.whatToFetch == "contactProfilePicture") {
      if (requestData.contactID == undefined) {
        throw new Error("More data needed to perform this operation!");
      } else {
        downloadLocation = "users/"+context.auth!.uid+"/images/contacts/"+requestData.contactID+"/";
      }
    } else if (requestData.whatToFetch == "userProfilePicture") {
      downloadLocation = "users/"+context.auth!.uid+"/images/profilePicture/";
    } else {
      throw new Error("Unknown fetch type!");
    }


    // Get the list of files/file in the selected directory
    const [files] = await adminImport.storage().bucket().getFiles({prefix: downloadLocation});
    const downloadedFiles : object[] = [];

    for (const file of files) {
      const [fileData] = await file.download();
      const base64Data = fileData.toString("utf8");
      let finalImage = "";

      // file.name includes the name of the file and the directory!
      const fileNameWithDir = file.name.split("/");
      const onlyFileName = fileNameWithDir[fileNameWithDir.length-1];

      // Check if file is encrypted
      if (base64Data.startsWith("data:image/jpeg;base64,")) {
        finalImage = base64Data;

        // If its not encrypted, but it should be, encrypt it
        // and upload it with the same name in order to replace the unencrypted version
        if (requestData.whatToFetch == "contactImages") {
          const encryptedImage = dataEncrypter.encryptData(base64Data);
          uploadFileToStorage(encryptedImage, downloadLocation, onlyFileName, adminImport);
        }
      } else {
        finalImage = dataEncrypter.decryptData(base64Data);
      }


      if (requestData.whatToFetch == "contactProfilePicture") {
        if (requestData.imageName == undefined) {
          throw new Error("More data needed to perform this operation!");
        }

        if (onlyFileName == requestData.imageName) {
          downloadedFiles.push({media_name: onlyFileName, url: finalImage});
          break;
        }
      } else {
        downloadedFiles.push({media_name: onlyFileName, url: finalImage});
      }
    }

    return downloadedFiles;
  }

  // DELETE IMAGES
  if (requestData.specificAction == "deleteContactImage") {
    let deleteLocation = "users/"+context.auth!.uid+"/images/contacts/";

    if (requestData.contactID == undefined || requestData.imageName == undefined) {
      throw new Error("More data needed to perform this operation!");
    } else {
      deleteLocation += requestData.contactID+"/"+requestData.imageName;
    }

    await adminImport.storage().bucket().file(deleteLocation).delete();
    return "Image deleted successfully.";
  }

  if (requestData.specificAction == "deleteAllContactImages") {
    if (requestData.contactID == undefined) {
      throw new Error("More data needed to perform this operation!");
    }

    const deleteLocation = "users/"+context.auth!.uid+"/images/contacts/"+requestData.contactID+"/";
    const [files] = await adminImport.storage().bucket().getFiles({prefix: deleteLocation});

    for (const file of files) {
      await file.delete();
    }

    return "All images deleted successfully.";
  }

  throw new Error("Unknown action");
}


async function optimizeImage(originalSource) {
  let resizedImage = "";

  // Remove base64 header from image source and convert it to buffer
  const originalImage = Buffer.from(originalSource.split(";base64,").pop(), "base64");

  // Load metadata from image
  const metadata = await sharp(originalImage).metadata();

  // Set maximum height or width for image
  const maxImageSize = 1920;

  // Check if image is bigger than max size
  if (metadata.width > maxImageSize || metadata.height > maxImageSize) {
    await sharp(originalImage)
        .resize((metadata.width > metadata.height ? {width: maxImageSize} : {height: maxImageSize}))
        .jpeg({quality: 75})
        .toBuffer().then((data) => {
          resizedImage = data.toString("base64");
        });
  } else {
    await sharp(originalImage)
        .jpeg({quality: 75})
        .toBuffer().then((data) => {
          resizedImage = data.toString("base64");
        });
  }

  return "data:image/jpeg;base64," + resizedImage;
}


async function uploadFileToStorage(encryptedFile, fileLocation, fileName, adminImport) {
  const bucket = adminImport.storage().bucket();
  const options = {resumable: false, metadata: {contentType: "text/plain"}};
  const file = bucket.file(fileLocation+fileName);

  file.save(encryptedFile, options).catch((err) => {
    return err;
  });

  return "File uploaded successfully.";
}
