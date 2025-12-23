# My Firebase Setup (Step-by-Step)

I already wrote the code for this, but you need to click a few buttons on the Firebase website to make it work.

### 1. Let people log in
- Go to **Authentication** on the left menu.
- Click the blue **Get Started** button.
- Go to the **Sign-in method** tab.
- Click on **Email/Password** and turn it on.
- Hit **Save**. 

### 2. Setup the Database
- Go to **Firestore Database** on the left.
- Click **Create Database**.
- Pick any city near you (Mumbai or Delhi is good).
- Choose **Test Mode** so we can start fast.
- Hit **Create**.

### 3. Put our site online
When you want to show the site to others, run these in the terminal:
1. `npm install -g firebase-tools` (Run this only once).
2. `firebase login` (Log in with your Gmail).
3. `npm run build` (This fixes the code for the web).
4. `firebase deploy` (This uploads it).

If anything goes wrong, just ask me!
