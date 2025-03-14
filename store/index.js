import { createStore } from "vuex";
import { userData } from "./userData";
import { auth } from "./auth";
import { navigationStacks } from "./navigationStacks";

export const store = createStore({
    modules: {
        navigationStacks,
        userData,
        auth,
    },
});
