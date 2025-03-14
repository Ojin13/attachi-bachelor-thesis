/**
 * Validates an email address format using a regular expression.
 * @param email - The email address to validate.
 * @returns True if the email address is valid, false otherwise.
 */
export default function validEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
