import { Preferences } from "@capacitor/preferences";

/**
 * Composable function that handles the Preferences API
 * provided by @capacitor/preferences. Preferences are
 * simple key-value pairs that are used to persistently
 * store simple data like user settings on the device.
 * Read more:
 * https://capacitorjs.com/docs/apis/preferences
 */
export function usePreferences() {
    /**
     * Get the value of the preference with the given key
     * @param keyName - The name of the preference
     * @returns The value of the preference or null if the preference is not set
     */
    const getPreferenceValue = async (keyName: string) => {
        const { value } = await Preferences.get({ key: keyName });
        return value;
    };

    /**
     * Set the value of the preference with the given key
     * @param keyName - The name of the preference
     * @param keyValue - The value of the preference to be set
     * @returns The value of the preference or null if the preference failed to be set
     */
    const setPreferenceValue = async (keyName: string, keyValue: string) => {
        await Preferences.set({ key: keyName, value: keyValue }).catch(() => {
            return null;
        });
        return keyValue;
    };

    /**
     * Delete the preference with the given key
     * @param keyName - The name of the preference to be deleted
     * @returns true if the preference was deleted, false if the deletion failed
     */
    const deletePreferenceValue = async (keyName: string) => {
        await Preferences.remove({ key: keyName }).catch(() => {
            return false;
        });
        return true;
    };

    return { getPreferenceValue, setPreferenceValue, deletePreferenceValue };
}
