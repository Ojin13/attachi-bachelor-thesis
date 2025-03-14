<template>
    <div style="display: none">
        <input id="imageUploadButton" name="imageUploadButton" :accept="allowedFileFormats" type="file" @change="onFileChange" />
    </div>
</template>

<script setup>
import Compressor from "compressorjs";

const { uploadImage } = useImageUpload();
const emit = defineEmits(["imageUploaded"]);
const props = defineProps({
    allowedFileFormats: {
        type: String,
        default: "image/jpeg, image/png, image/tiff ,image/webp, image/gif",
    },
    customUploadedFileName: {
        type: String,
        default: null,
    },
    uploadType: {
        type: String,
        default: "",
    },
    encryptImage: {
        type: Boolean,
        default: true,
    },
    contactID: {
        type: String,
        required: false,
        default: "",
    },
});

const onFileChange = (e) => {
    let files = e.target.files || e.dataTransfer.files;

    if (!files.length) {
        console.log("No file selected");
        return;
    }

    const pictureName = props.customUploadedFileName != null ? props.customUploadedFileName : Date.now().toString();
    let selectedFile = e.target.files[0];

    uploadImage(selectedFile, pictureName, props.uploadType, props.contactID.toString(), props.encryptImage);

    // No need to wait for the upload to finish to show the image - we have local version  available immediately.
    // However its better to still compress the image since the original image might be so large it could cause performance issues.
    new Compressor(selectedFile, {
        quality: 0.75,
        maxWidth: 1000,
        maxHeight: 1000,
        success: (result) => {
            selectedFile = result;
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = () => {
                emit("imageUploaded", pictureName, reader.result ?? "");
            };
        },
        error: (err) => {
            console.log(err.message);
        },
    });
};
</script>
