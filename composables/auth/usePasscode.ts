import { Haptics, ImpactStyle } from "@capacitor/haptics";
import type { PasscodeStatus } from "~/types";

/**
 * Composable function for handling passcode logic.
 * Passcode is a sequence of digits that user can setup, which
 * is used to unlock the app every time it is opened or reopend
 * after a certain period of time.
 */
export function usePasscode() {
    const { getPreferenceValue, setPreferenceValue, deletePreferenceValue } = usePreferences();
    const passcodeValue = ref("");
    const MAX_PASSCODE_LENGTH = 6;
    const MIN_PASSCODE_LENGTH = 4;

    /**
     * Adds a digit to the passcode
     * @param digit - The digit to add to the passcode
     * @returns void
     */
    const addDigit = (digit: number): void => {
        if (passcodeValue.value.length < MAX_PASSCODE_LENGTH) {
            passcodeValue.value += digit.toString();
            Haptics.impact({ style: ImpactStyle.Medium });
        }
    };

    /**
     * Removes the last digit from the passcode
     * @returns void
     * */
    const removeDigit = (): void => {
        if (passcodeValue.value.length > 0) {
            passcodeValue.value = passcodeValue.value.slice(0, -1);
            Haptics.impact({ style: ImpactStyle.Heavy });
        }
    };

    /**
     * Resets the passcode value to an empty string
     * @returns void
     */
    const resetPasscode = (): void => {
        passcodeValue.value = "";
    };

    /**
     * Checks if the passcode is correct and returns a boolean.
     * Correct passcode is provided from the component and is in base64 format.
     * @param correctPasscode - The correct passcode in base64 format
     * @returns boolean
     */
    const isValidPasscode = (expectedValue: string): boolean => {
        return btoa(passcodeValue.value) === expectedValue;
    };

    const getPasscodeByUser = async (uid: string) => {
        const passcode = await getPreferenceValue(uid + "-passcode");
        return passcode;
    };

    const setPasscodeByUser = async (uid: string, value: string) => {
        await setPreferenceValue(uid + "-passcode", value);
    };

    const deletePasscodeByUser = async (uid: string) => {
        await deletePreferenceValue(uid + "-passcode");
    };

    /***
     * Possible values:
     * null/undefined --> user did not declare if he/she wants to use passcode yet
     * 'userHasPasscode' --> user has passcode set
     * 'userHasNoPasscode' --> user has no passcode set
     */
    const getPasscodeExistenceByUser = async (uid: string): Promise<PasscodeStatus | null> => {
        const passcodeExistence = (await getPreferenceValue(uid + "-hasPasscode")) as PasscodeStatus;
        return passcodeExistence;
    };

    const setPasscodeExistenceByUser = async (uid: string, value: string) => {
        await setPreferenceValue(uid + "-hasPasscode", value);
    };

    return {
        MAX_PASSCODE_LENGTH,
        MIN_PASSCODE_LENGTH,
        passcodeValue,
        addDigit,
        removeDigit,
        isValidPasscode,
        resetPasscode,
        getPasscodeByUser,
        setPasscodeByUser,
        deletePasscodeByUser,
        getPasscodeExistenceByUser,
        setPasscodeExistenceByUser,
    };
}
