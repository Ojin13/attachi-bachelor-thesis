/**
 * Composable function that provides password validation functionality.
 * This includes checking if the password meets complexity requirements
 * and if the password and passwordCheck are the same.
 */
export function usePasswordValidation() {
    /**
     * Validates the password complexity and checks if the password and
     * passwordCheck are the same.
     * @param password - Reference to the password input
     * @param passwordCheck - Reference to the passwordCheck input
     * @returns string - Error message if validation fails, null if validation passes
     */
    const validatePassword = (password: Ref<string>, passwordCheck: Ref<string>): string | null => {
        // Check if password and passwordCheck are not empty
        if (password.value == "" || passwordCheck.value == "") {
            return "Please enter both passwords";
        }

        // Check if password and passwordCheck are the same
        if (password.value != passwordCheck.value) {
            return "Passwords do not match";
        }

        // Check if password meets complexity requirements
        let passwordComplexityError = checkPasswordComplexity(password.value);
        if (passwordComplexityError != null) {
            return passwordComplexityError;
        }

        return null;
    };

    /**
     * Checks if the password meets the complexity requirements
     * @param password - Password to be validated
     * @returns string - Error message if validation fails, null if validation passes
     */
    const checkPasswordComplexity = (password: string) => {
        if (!password.match(/^(?=.*[a-z])/)) {
            // (?=.*[a-z]) - at least one lowercase letter
            return "Password must contain at least one lowercase letter.";
        } else if (!password.match(/^(?=.*[A-Z])/)) {
            // (?=.*[A-Z]) - at least one uppercase letter
            return "Password must contain at least one uppercase letter.";
        } else if (!password.match(/^(?=.*[0-9])/)) {
            // (?=.*[0-9]) - at least one number
            return "Password must contain at least one number.";
        } else if (!password.match(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)) {
            // ^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]) - at least one special character
            return "Password must contain at least one special character.";
        } else if (!password.match(/^(?=.{8,})/)) {
            // (?=.{8,}) - at least 8 characters
            return "Password must contain at least 8 characters.";
        } else if (password.toLowerCase().includes("password")) {
            // Check if password contains the word 'password'
            return "Password cannot contain the word 'password'.";
        }

        return null;
    };

    return { validatePassword };
}
