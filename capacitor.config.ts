import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'cz.ojin.app',
  appName: 'Attachi',
  webDir: 'dist',
  
/*

  For local development, you can use the following configuration:

  npx nuxt dev --hostname 192.168.100.26 --port 3333 --host

  server: {
    url: 'http://192.168.100.26:3333',
    cleartext: true
  },
*/
  
  backgroundColor: '#fffff9',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ["google.com", "apple.com"],
    },
    CapacitorCookies: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 4000,
      launchAutoHide: true,
      launchFadeOutDuration: 1000,
      backgroundColor: "#ffffE9",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "large",
      spinnerColor: "#90bf74",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    Keyboard: {
      resize: KeyboardResize.Native,
      resizeOnFullScreen: true,
    },
    // https://ionic.io/docs/appflow/deploy/setup/capacitor-sdk
    LiveUpdates: {
      appId: '*****************',
      channel: 'Production',
      autoUpdateMethod: 'none',
      maxVersions: 2,
      enabled: true,
    }
  }
};

export default config;
