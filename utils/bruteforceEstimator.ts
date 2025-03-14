/**
 * This function takes a password and returns an estimate of how long it would take to crack it
 * using an offline brute force attack. The estimate is based on the number of possible combinations
 * and the number of attempts per second. Estimate is very rough, but gives a good idea of the
 * strength of the password.
 *
 * This function was tested to roughly match the estimates from:
 * https://www.proxynova.com/tools/brute-force-calculator/
 *
 * @param password - The password to estimate the brute force time for
 * @returns An object with the estimated duration and information text to display in the UI
 */
export default function estimateBruteForceTime(password: string) {
    const charsetSize = getCharsetSize(password);
    const combinations = Math.pow(charsetSize, password.length);
    const attemptsPerSecond = 90000000000000;
    let seconds = combinations / attemptsPerSecond;

    // Alter short password bruteforce time to at least 1 second
    if (password.length > 5 && seconds < 1) {
        seconds = 1;
    }

    let minutes = Math.round(seconds / 60);
    let hours = Math.round(seconds / (60 * 60));
    let days = Math.round(seconds / (60 * 60 * 24));
    let weeks = Math.round(seconds / (60 * 60 * 24 * 7));
    let months = Math.round(seconds / (60 * 60 * 24 * 30));
    let years = Math.round(seconds / (60 * 60 * 24 * 365));

    // Force usage of months to prevent skipping straight to many years
    if (years >= 1 && years <= 5) {
        years = 0;
        months /= 3;
    }

    // Throttle years growth
    if (years > 100) {
        years /= 10;
    }

    let infoSentence = "Password could be cracked in roughly: ";
    let result = "";

    // Prepare info sentence for the UI
    if (years >= 1) {
        result += years.toFixed(0) + (years == 1 ? " year 😎" : " years 😎");
    } else if (months >= 1) {
        result += months.toFixed(0) + (months == 1 ? " month 🧐" : " months 🧐");
    } else if (weeks >= 1) {
        result += weeks.toFixed(0) + (weeks == 1 ? " week 🤨" : " weeks 🤨");
    } else if (days >= 1) {
        result += days.toFixed(0) + (days == 1 ? " day 😐" : " days 😐");
    } else if (hours >= 1) {
        result += hours.toFixed(0) + (hours == 1 ? " hour 😑" : " hours 😑");
    } else if (minutes >= 1) {
        result += minutes.toFixed(0) + (minutes == 1 ? " minute 😭" : " minutes 😭");
    } else if (seconds >= 1) {
        result += seconds.toFixed(0) + (seconds == 1 ? " second 💀" : " seconds 💀");
    } else {
        infoSentence = "Password could be cracked in few milliseconds 💀";
    }

    return {
        result: result,
        infoText: infoSentence,
        seconds: seconds,
        minutes: minutes,
        hours: hours,
        days: days,
        weeks: weeks,
        months: months,
        years: years,
    };
}

/**
 * This is a helper function to calculate the size of the character set used in the password.
 * With this information, we can calculate the number of possible combinations for the password
 * and estimate the time needed to crack it.
 */
export function getCharsetSize(password: string) {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    let charsetSize = 0;
    if (hasLowercase) charsetSize += 26;
    if (hasUppercase) charsetSize += 26;
    if (hasNumbers) charsetSize += 10;
    if (hasSpecial) charsetSize += 32; // Assuming 32 common special characters

    return charsetSize;
}
