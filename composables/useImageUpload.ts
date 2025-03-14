import { ServerAction, type ImageUpload, type UploadType } from "~/types";
import Compressor from "compressorjs";

/**
 * Composable function that handles the image upload process.
 */
export function useImageUpload() {
    const { callFire } = useFirebaseConnector();

    /**
     * This function takes an image, compresses it and sends to the Firebase Cloud function
     * where it is further optimized with sharp and then encrypted and uploaded to the storage bucket.
     * @param $file - The image file to upload.
     * @param pictureName - The name of the image for the storage bucket.
     * @param uploadType - The type of image to upload.
     * @param contactID - The ID of the contact to upload the image for.
     * @param encryptImage - Whether to encrypt the image or not.
     * @returns {Promise<void>}
     */
    const uploadImage = async ($file: any, pictureName: string, uploadType: UploadType, contactID = "", encryptImage = true) => {
        let payloadData: ImageUpload = {
            specificAction: "uploadImage",
            imageName: pictureName,
            uploadType: uploadType,
            doNotEncrypt: !encryptImage,
            contactID: contactID,
            imageSource: "",
        };

        // Check if $file is a string, if not, convert it to a base64 string
        // If its already a string, it means its a URL and it can be used directly
        if (typeof $file === "string") {
            payloadData.imageSource = $file;
            requestUpload(payloadData);
        } else {
            // Compress the image before uploading
            // This is necessary to reduce payload size which is critical for mobile apps
            // Furthermore since image is uploaded as base64 string, its size is increased
            // approximately by 33% due to encoding so without compression, the image size
            // would be unacceptable. Compressorjs with quality 0.6 reduces the size by 67%
            // See more at: https://github.com/fengyuanchen/compressorjs
            new Compressor($file, {
                quality: 0.6,
                maxWidth: 800,
                maxHeight: 800,
                success: (result) => {
                    $file = result;
                    const reader = new FileReader();
                    reader.readAsDataURL($file);
                    reader.onload = () => {
                        payloadData.imageSource = reader.result ?? "";
                        requestUpload(payloadData);
                    };
                },
                error: (err) => {
                    console.log(err.message);
                },
            });
        }
    };

    /**
     * Helper function for calling the Firebase function to upload the image.
     * @param payload - The payload to send to the Firebase function.
     */
    const requestUpload = (payload: ImageUpload) => {
        callFire({
            action: ServerAction.manageImages,
            ...payload,
        });
    };

    return { uploadImage };
}
