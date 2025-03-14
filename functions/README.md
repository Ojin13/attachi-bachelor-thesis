--------Disclaimer--------
Please follow official documentation of services used in this project for more information. Steps provided here are just a brief
not-complete overview of the setup process. Actual setup may vary depending on the version of the services and the time of the setup.

----------------
Firebase and DB setup:
----------------

1. Go to the Firebase console at: https://console.firebase.google.com/ and create a new project.
2. Add new Web App to the Firebase project and copy the configuration object to ~/plugins/firebase.ts
3. Add new Android and iOS app to the Firebase project and download google-services.json and GoogleService-Info.plist files.
4. Place these two files to the ios and android folders according to Firebase instructions.
5. Make sure that you have installed Node.js 18 or higher. Then run “npm install -g firebase-tools” and “npm i” in the root of the project.
6. Run “firebase” command and login to your Google account, that was used to create Firebase project.
5. Run “firebase use <project ID>” to select the Firebase project.
6. Upgrade the created Firebase project from Spark to Blaze plan (Pay as you go) in order to deploy Cloud functions.
7. Replace all remaining occurences of <<*****************>> with new API keys and other values from Firebase project settings.
7. In order to deploy Cloud functions to the Firebase project, navigate to ~/functions/ and run 
    1. npm run lint -- --fix
    2. firebase deploy
8. In the Firebase project, add Email/Password, Google and Apple sign-in methods in Authentication → Sign-in methods.
    1. For Google sign-in method, configure Web client ID and Web client secret. You can find these values in Google Cloud Console → API & Services → Credentials.
    2. For Apple sign-in method, configure Service ID, Key ID, Apple team ID and a Private key. You can find these values in Apple Developer Console.
9. Disable passwordless sign-in and allow Linking accounts that use the same email. Add localhost to the list of authorized domains.
10. Click on settings icon next to project overview in Firebase project and go to project settings → General.
    1. Set Default GCP resource location as eur3 (europe-west)
11. Click on settings icon next to project overview in Firebase project and go to project settings → Service accounts and click Generate new private key.
    1. Copy content of generated file and paste it to ~functions/serviceAccountKey.json
    2. Go to ~functions/firebaseAdminSDK.ts and set projectId to the created firebase project ID.
12. Click on All products → Storage → Get Started → Start in production mode → done
    1. Go to Storage → Rules and paste the provided Rule-set from the ~/functions/firebase_storageBucket_rules.md
    2. In Storage→Files copy the folder path (looks like gs://xxx.xxx.com) and paste it to ~/functions/firebaseAdminSDK.ts as storageBucket (remove gs:// prefix)
13. To prepare the database, enter the connection string in the .evn file and apply the schema.prisma file to the database by running:
    1. npx prisma db push
    2. npx prisma generate
14. Upload CSV files from ~/functions/initialDatabaseData/ to the database. For more information see the README.md in the initialDatabaseData folder.
15. Change the scheme of the database tables to private (if deploying to Supabase).


    
----------------
Useful commands:
----------------

1.) To build typescript and serve it on localhost run:
npm run serve


2.) To introspect database changes run:
npx prisma db pull


3.) To push prisma scheme to database run:
npx prisma db push


4.) To rename db pkey name run this in supabase SQL editor:
ALTER TABLE tablename RENAME CONSTRAINT constraint_name TO new_constraint_name;


5.) To move table to private schema on supabase SQL editor run:
ALTER TABLE tablename SET SCHEMA private;


6.) To deploy functions to the Firebase run:
npx prisma generate
npm run lint -- --fix
firebase deploy --only functions
