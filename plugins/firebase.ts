import { initializeApp } from "firebase/app";
import { Capacitor } from "@capacitor/core";
import { getApp } from "firebase/app";
import { getAuth, indexedDBLocalPersistence, initializeAuth } from "firebase/auth";

/**
 * Connect application to the Firebase project. These configurations can
 * be obtained from the Firebase Console.
 */
export default defineNuxtPlugin(() => {
    initializeApp({
        apiKey: "*****************",
        authDomain: "*****************",
        projectId: "*****************",
        storageBucket: "*****************",
        messagingSenderId: "*****************",
        appId: "*****************",
        measurementId: "*****************",
    });

    if (Capacitor.isNativePlatform()) {
        initializeAuth(getApp(), {
            persistence: indexedDBLocalPersistence,
        });
    } else {
        getAuth();
    }
});
