# My Firebase Setup Guide

I have already put the code in `src/firebase.js`, but you still need to do a few things in the **Firebase Console** (website). 

Follow these simple steps:

## 1. Authentication (Login)
- Go to the **Authentication** tab on the left.
- Click **Get Started**.
- Go to **Sign-in method**.
- Click **Email/Password** and click **Enable**.
- Click **Save**.
- *Now the login will work!*

## 2. Firestore Database
- Go to the **Firestore Database** tab on the left.
- Click **Create Database**.
- Select **Location** (Delhi or Mumbai is best).
- Start in **Test Mode** for now (we already have rules in `firestore.rules` for later).
- Click **Create**.

## 3. Deployment (How to put it online)
If you want to put your website online, follow these steps in my terminal:
1. Type `npm install -g firebase-tools` (only if you haven't done it).
2. Type `firebase login` (to sign in to your account).
3. Type `npm run build` (**IMPORTANT**: This makes my code ready for the internet).
4. Type `firebase deploy` (to push my code to the web).

---
If you see any error in the console about "Permission Denied", tell me!
