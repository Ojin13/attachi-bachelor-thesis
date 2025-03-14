# Attachi

Please remember that this project won't work without proper configuration of a new Firebase project and several other API keys.
Values that need to be configured for a local development are marked as <<*****************>>. If you really want to run this project
locally, instead of trying the released version, please follow README.md in the functions folder. There you will find more specific
instruction on how to configure new Firebase project..

Since the configuration process is rather complicated, you can try the final version of this application on:
Google Play Store: https://play.google.com/store/apps/details?id=cz.ojin.app
App Store: https://apps.apple.com/cz/app/attachi/id6449395592
Website: https://www.attachi.net/

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production
$ npm run build

# generate static project
$ npm run generate

# To build Android icons/splash screens
$ npx @capacitor/assets generate --android

# Generate Android project
$ npm run build
$ npx cap sync
$ npx cap open android

# Generate IOS project
$ npm run build
$ npx cap sync
$ npx cap open ios
```
