import type { Question, ZodiacSigns } from "~/types";

/**
 * Composable function that handles the derivation of dependent questions
 * based on the answer of the parent question. For example, birth date can
 * determine the age of the person or the zodiac sign...
 */
export function useDependencyResolver() {
    /**
     * Derives the answer for a dependent question based on the answer of the parent question.
     * @param parentQuestion - The parent question that determines the answer for the dependent question.
     * @param dependentQuestion - The dependent question that has its answer derived from the parent question.
     * @returns The derived answer for the dependent question as a string or undefined if the answer cannot be derived.
     */
    const deriveDependentAnswer = (parentQuestion: Question, dependentQuestion: Question): string | undefined => {
        if (!parentQuestion.answer) {
            return undefined;
        }

        // If parent question is Birth date
        if (parentQuestion.id == 1) {
            // If dependent question is age
            if (dependentQuestion.id == 2) {
                return resolveAge(parentQuestion.answer);
            }
            // If dependent question is zodiac sign
            if (dependentQuestion.id == 32) {
                return resolveZodiac(parentQuestion.answer);
            }
            // If dependent question is chinese zodiac sign
            if (dependentQuestion.id == 34) {
                return resolveChineseZodiac(parentQuestion.answer);
            }
            // If dependent question is Generation name
            if (dependentQuestion.id == 99) {
                return resolveGenerationName(parentQuestion.answer);
            }
        }

        // If parent question is zodiac sign
        if (parentQuestion.id == 32) {
            // If dependent question is element of zodiac sign
            if (dependentQuestion.id == 31) {
                return resolveElement(parentQuestion.answer);
            }
        }

        // If no internal logic for derivation foud return undefined
        return undefined;
    };

    return { deriveDependentAnswer };
}

/**
 * Helper function to resolve the age from a birth date.
 * @param baseAnswer - The birth date in the format of "DD/MM/YYYY".
 * @returns The age as a string or undefined if the birth date is invalid.
 */
function resolveAge(baseAnswer: string) {
    const dateArray = baseAnswer.split("/");

    // if invalid date
    if (dateArray.includes("")) {
        return undefined;
    }

    // Calculate age from birth date
    const birthDate = new Date(parseInt(dateArray[2]), parseInt(dateArray[1]) - 1, parseInt(dateArray[0]));
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    return age.toString();
}

/**
 * Helper function to resolve the zodiac sign from a birth date.
 * @param baseAnswer - The birth date in the format of "DD/MM/YYYY".
 * @returns The zodiac sign as a string or undefined if the birth date is invalid.
 */
function resolveZodiac(baseAnswer: string) {
    const dateArray = baseAnswer.split("/");

    // if invalid date
    if (dateArray.includes("")) {
        return undefined;
    }

    // Determine zodiac sign from birth date
    const month = dateArray[1];
    const day = dateArray[0];

    const zodiacSigns: ZodiacSigns = {
        Capricorn: "12/22-1/19",
        Aquarius: "1/20-2/18",
        Pisces: "2/19-3/20",
        Aries: "3/21-4/19",
        Taurus: "4/20-5/20",
        Gemini: "5/21-6/21",
        Cancer: "6/22-7/22",
        Leo: "7/23-8/22",
        Virgo: "8/23-9/22",
        Libra: "9/23-10/22",
        Scorpio: "10/23-11/22",
        Sagittarius: "11/23-12/21",
    };

    let zodiacSign = "";

    Object.keys(zodiacSigns).forEach((key) => {
        const zodiacSignRange = zodiacSigns[key].split("-");
        const zodiacSignStart = zodiacSignRange[0].split("/");
        const zodiacSignEnd = zodiacSignRange[1].split("/");

        if ((month == zodiacSignStart[0] && day >= zodiacSignStart[1]) || (month == zodiacSignEnd[0] && day <= zodiacSignEnd[1])) {
            zodiacSign = key;
        }
    });

    return zodiacSign.toString();
}

/**
 * Helper function to resolve the Chinese zodiac sign from a birth date.
 * @param baseAnswer - The birth date in the format of "DD/MM/YYYY".
 * @returns The Chinese zodiac sign as a string or undefined if the birth date is invalid.
 */
function resolveChineseZodiac(baseAnswer: string) {
    const dateArray = baseAnswer.split("/");

    if (dateArray[2] == "" || dateArray[2] == undefined) {
        return undefined;
    }

    const year = parseInt(dateArray[2]);

    switch (year % 12) {
        case 0:
            return "Monkey";
        case 1:
            return "Rooster";
        case 2:
            return "Dog";
        case 3:
            return "Pig";
        case 4:
            return "Rat";
        case 5:
            return "Ox";
        case 6:
            return "Tiger";
        case 7:
            return "Rabbit";
        case 8:
            return "Dragon";
        case 9:
            return "Snake";
        case 10:
            return "Horse";
        case 11:
            return "Goat";
    }

    return undefined;
}

/**
 * Helper function to resolve the element from a zodiac sign.
 * @param baseAnswer - The zodiac sign as a string.
 * @returns The element as a string or undefined if the zodiac sign is invalid.
 */
function resolveElement(baseAnswer: string) {
    switch (baseAnswer) {
        case "Aries":
        case "Leo":
        case "Sagittarius":
            return "Fire";
        case "Taurus":
        case "Virgo":
        case "Capricorn":
            return "Earth";
        case "Gemini":
        case "Libra":
        case "Aquarius":
            return "Air";
        case "Cancer":
        case "Scorpio":
        case "Pisces":
            return "Water";
    }

    return undefined;
}

/**
 * Helper function to resolve the generation name from a birth date.
 * @param baseAnswer - The birth date in the format of "DD/MM/YYYY".
 * @returns The generation name as a string or undefined if the birth date is invalid.
 */
function resolveGenerationName(baseAnswer: string) {
    const dateArray = baseAnswer.split("/");

    if (dateArray[2] == "" || dateArray[2] == undefined) {
        return undefined;
    }

    const year = parseInt(dateArray[2]);

    if (year < 1883) {
        return "Generation before 1883";
    } else if (year >= 1883 && year <= 1900) {
        return "Lost Generation (1883 - 1900)";
    } else if (year >= 1901 && year <= 1927) {
        return "The Greatest Generation (1901-1927)";
    } else if (year >= 1928 && year <= 1945) {
        return "The Silent Generation (1928 - 1945)";
    } else if (year >= 1946 && year <= 1964) {
        return "Baby Boomer Generation (1946 - 1964)";
    } else if (year >= 1965 && year <= 1980) {
        return "Generation X (1965 - 1980)";
    } else if (year >= 1981 && year <= 1996) {
        return "Millennials (1981 - 1996)";
    } else if (year >= 1997 && year <= 2012) {
        return "Generation Z (1997 - 2012)";
    } else if (year >= 2013 && year <= 2025) {
        return "Generation Alpha (2013 - 2025)";
    } else {
        return "Yet to be named generation";
    }
}
