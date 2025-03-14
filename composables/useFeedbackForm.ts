import { ServerAction } from "~/types";

/**
 * Composable function for handling form submission.
 * This logic is shared for all forms in the app such
 * as feedback forms, bug reports, etc.
 */
export function useFeedbackForm() {
    const { callFire } = useFirebaseConnector();
    const showFormError = ref(false);
    const showFormSuccess = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");
    const formContent = ref("");

    /**
     * This function checks the validity of the form submission
     * and sends the form data to the Firebase function for processing.
     * Then it displays a success or error message based on the response.
     * @param submissionPrefix - The prefix to add to the form content. Can be used to identify the form type.
     * @returns void
     */
    const submitForm = (submissionPrefix: string) => {
        showFormError.value = false;
        showFormSuccess.value = false;

        if (formContent.value == "") {
            showFormError.value = true;
            errorMessage.value = "Please enter a message";
            return;
        }

        callFire({ action: ServerAction.newFeedback, feedback_content: submissionPrefix + "\n\nMessage:\n" + formContent.value }).then((response) => {
            formContent.value = "";
            successMessage.value = "Your message has been submitted. Thank you for your feedback!";
            showFormSuccess.value = true;

            if (!response) {
                errorMessage.value = "There was an error submitting your message. Please try again later.";
                showFormError.value = true;
            }
        });
    };

    return {
        showFormError,
        showFormSuccess,
        errorMessage,
        successMessage,
        formContent,
        submitForm,
    };
}
