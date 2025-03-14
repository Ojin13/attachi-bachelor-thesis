import type { ServerAction, RequestData, ResponseData } from "~/types";
import { httpsCallable, getFunctions, type HttpsCallableResult } from "firebase/functions";
import { getApp } from "firebase/app";

/**
 * Composable function that handles the connection to the Firebase functions.
 * Specifically, this solution uses the Firebase callable functions, which automatically
 * handles the authentication and authorization of the user by auto-appending the user
 * authentication token to the request.
 *
 * To read more about Firebase callable functions, visit:
 * https://firebase.google.com/docs/functions/callable
 */
export function useFirebaseConnector() {
    const { getPreferenceValue } = usePreferences();

    const region = "europe-west3";
    const endpointName = "API";

    /**
     * Calls the Firebase function with the provided RequestData. Provided RequestData are also appended
     * with users' encryption key, that is needed for decryption of the data on the server side.
     *
     * Returns null in case of any backend error/exception/missing data for the action...
     *
     * @param data - The data to send to the Firebase function, which will determine the action to take.
     * @param action - The action to take in the Firebase function.
     * @returns {Promise<any>} - The response from the Firebase function or null if an error occurred.
     */
    const callFire = async (requestBody: RequestData, action: ServerAction | null = null): Promise<any> => {
        const API = httpsCallable(getFunctions(getApp(), region), endpointName);

        if (action) {
            requestBody.action = action;
        }

        return API(await appendAuthKeys(requestBody))
            .then((result: HttpsCallableResult) => {
                const response: ResponseData = result.data as ResponseData;

                if (response.code == 200) {
                    return response.answer;
                } else {
                    return null;
                }
            })
            .catch((error) => {
                console.error(error);
                return null;
            });
    };

    /**
     * Appends the user's encryption key to the provided RequestData.
     * @param data - The data to append the encryption key to.
     * @returns {Promise<RequestData>} - The data with the encryption key appended.
     */
    const appendAuthKeys = async (data: RequestData): Promise<RequestData> => {
        data.encryptionKey = (await getPreferenceValue("encryptionKey")) ?? "";
        return data;
    };

    return { callFire, appendAuthKeys };
}
