/**
 * This function takes a contact name and a domain and returns the similarity between the two in percentage (0-100).
 * The function generates all possible order combinations of the contact name and compares them to the domain name.
 * The comparison is case-insensitive and ignores special characters. The best match is returned.
 *
 * @param contactName - The contact name to compare
 * @param domain - The domain to compare
 * @param domainNameSanitized - If true, the domain name is already sanitized and does not need to be processed (removing www, TLD, etc.)
 * @returns The best similarity between the contact name and the domain in percentage (0-100)
 */
export default function getContactNameDomainSimilarity(contactName: string, domain: string, domainNameSanitized: boolean = false) {
    let domainName = domain;

    if (!domainNameSanitized) {
        const domainParts = domain.split(".");

        // Remove www
        if (domainParts[0] == "www") {
            domainParts.shift();
        }

        // Remove TLD
        domainParts.pop();
        domainName = domainParts.join(".");
    }

    // Get all order combinations of contact name
    const allCombinations = allOrderCombinations(contactName);

    let maxSimilarity = 0;

    allCombinations.forEach((combination) => {
        const similarity = getPercentualSimilarityOfStrings(combination, domainName);
        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
        }
    });

    return maxSimilarity;
}

/**
 * This function takes an array of strings and returns all possible
 * order combinations of these strings.
 * @param arr - The array of strings to generate permutations for
 * @returns An array of all possible order combinations of the input strings
 *
 * Example:
 * getPermutations([1,2,3]) => [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
 */
function getPermutations(arr: string[]) {
    if (arr.length === 0) return [[]];

    const firstElement = arr[0];
    const rest = arr.slice(1);

    const permsWithoutFirst = getPermutations(rest);
    const allPermutations: string[] = [];

    permsWithoutFirst.forEach((perm) => {
        for (let i = 0; i <= perm.length; i++) {
            const permWithFirst: any = [...perm.slice(0, i), firstElement, ...perm.slice(i)];
            allPermutations.push(permWithFirst);
        }
    });

    return allPermutations;
}

/**
 * This function takes a string and returns all possible order combinations of the words in the string.
 * All word combinations are put togetger with several separators (space, hyphen, dot).
 * @param inputString - The string to generate order combinations for
 * @returns An array of all possible order combinations of the input string
 *
 * Example:
 * allOrderCombinations("1 2 3") => ["1-2-3", "132", "2.1.3",  ...]
 */
function allOrderCombinations(inputString: string) {
    const words = inputString.split(" ");

    // If there are more than 7 words, combine the last words into one
    // More than 7 words would result in too many permutations and slow computation
    if (words.length > 7) {
        words[6] = words.slice(6).join(" ");
        words.splice(7);
    }

    const permutations = getPermutations(words);

    let allCombinations: string[] = [];
    const separators = ["", "-", "."];

    for (let i = 0; i < separators.length; i++) {
        allCombinations = [...allCombinations, ...permutations.map((perm) => [...perm].join(separators[i]))];
    }

    return allCombinations;
}

/**
 * This function calculates the Levenshtein distance between two strings.
 * The Levenshtein distance is a method to measure how different two strings are.
 * @param firstString - The first string to compare
 * @param secondString - The second string to compare
 * @returns The Levenshtein distance between the two strings
 */
function levenshteinDistance(firstString: string, secondString: string) {
    // Convert the strings to lowercase
    firstString = firstString.toLowerCase();
    secondString = secondString.toLowerCase();

    // Initialize a matrix with zeros based on the lengths of the two strings
    const matrix = Array.from({ length: firstString.length + 1 }, () => new Array(secondString.length + 1).fill(0));

    // Fill the first row and first column of the matrix
    for (let i = 0; i <= firstString.length; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= secondString.length; j++) {
        matrix[0][j] = j;
    }

    // Compute the rest of the matrix
    for (let i = 1; i <= firstString.length; i++) {
        for (let j = 1; j <= secondString.length; j++) {
            const substitutionCost = firstString[i - 1] === secondString[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // deletion
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j - 1] + substitutionCost, // substitution
            );
        }
    }

    return matrix[firstString.length][secondString.length];
}

/**
 * This function calculates the similarity between two strings
 * and returns the percentage of similarity(0-100).
 * @param firstString - The first string to compare
 * @param secondString - The second string to compare
 * @returns The percentage of similarity between the two strings (0-100)
 */
function getPercentualSimilarityOfStrings(firstString: string, secondString: string): number {
    const maxLen = Math.max(firstString.length, secondString.length);
    if (maxLen === 0) {
        return 100; // both strings are empty
    }
    const distance = levenshteinDistance(firstString, secondString);
    return Math.round(((maxLen - distance) / maxLen) * 100);
}
