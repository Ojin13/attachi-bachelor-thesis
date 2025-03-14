import { ServerAction, YesNoValue } from "~/types";

/**
 * Composable function to handle the recovery code generation
 * and its storing in the preferences API.
 * @param activeLoader - The loader state
 */
export default function useRecoveryCodeForm(activeLoader: Ref<boolean>) {
    const { getCurrentRoute } = useIonicRouter();
    const { setPreferenceValue } = usePreferences();
    const { callFire } = useFirebaseConnector();

    const recoveryCode = ref("");

    const generateNewCode = () => {
        callFire({ action: ServerAction.generateRecoveryCode }).then(async (response) => {
            await setPreferenceValue("hasRecoveryCode", YesNoValue.Yes);
            recoveryCode.value = response.recoveryCode;
            activeLoader.value = false;
        });
    };

    onMounted(() => {
        if (getCurrentRoute().query.autoGenerateCodeOnVisit == YesNoValue.true) {
            activeLoader.value = true;
            generateNewCode();
        }
    });

    return {
        generateNewCode,
        recoveryCode,
    };
}
