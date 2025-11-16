# TripSync: Real-Time Collaborative Trip Planner

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.72%2B-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2050%2B-purple)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v9%2B-orange)](https://firebase.google.com/)

A full-stack React Native mobile application designed to simplify group travel planning. TripSync allows users to collaboratively create itineraries, track shared expenses in real-time, and stay organized on the go.

---

## 📸 Showcase & Demo

A picture is worth a thousand words. Here’s a look at TripSync in action.

| Login & Trip Creation | Trip Itinerary & Map View | Shared Expense Tracking |
| :--------------------: | :-----------------------: | :-----------------------: |
| *[TODO: Insert a GIF of the user logging in, creating a trip, and seeing it on the home screen]* | *[TODO: Insert a GIF of a user opening a trip, scrolling the itinerary, and viewing pins on the map]* | *[TODO: Insert a GIF of adding an expense and seeing the 'who owes whom' summary update in real-time]* |

| Add Place with Google API | Add New Expense Form |
| :------------------------: | :-------------------: |
| *[TODO: Screenshot of the "Add Place" screen showing Google Places Autocomplete suggestions]* | *[TODO: Screenshot of the "Add Expense" form with the pickers and checkboxes]* |

---

## 🤔 The Problem

Planning a trip with friends or family often involves messy group chats, confusing spreadsheets for expenses, and scattered information about places to visit. It's difficult to keep everyone on the same page and even harder to figure out who owes whom at the end of the trip.

## ✨ The Solution

TripSync solves this by providing a single, centralized platform for group travel. It combines a real-time itinerary planner with an intelligent shared expense tracker, ensuring all trip information is organized, accessible, and always up-to-date for every member.

---

## 🚀 Core Features

### 👤 **Authentication & User Management**
*   **Secure Sign-Up & Login:** Users can create accounts and log in using Firebase Authentication.
*   **Session Persistence:** User login state is persisted across app launches using AsyncStorage, providing a seamless experience.

### ✈️ **Collaborative Trip Planning**
*   **Trip Creation:** Authenticated users can create new trips.
*   **Real-Time Member Invites:** Trip owners can invite friends to a trip in real-time by adding their email address.
*   **Shared Itinerary:** All trip members can view and add places to the itinerary. Changes are reflected instantly for all members using Firestore listeners.

### 🗺️ **Itinerary & Place Management**
*   **Google Places API Integration:** Instead of manual entry, users can search for landmarks, restaurants, and points of interest using a powerful Google Places Autocomplete search bar, which auto-fills the address and coordinates.
*   **Event Scheduling:** Each place can be assigned a specific date and time, transforming a simple list into a structured itinerary.
*   **Photo Uploads:** Users can upload a custom photo for each itinerary item, which is stored in Firebase Storage.
*   **Map Visualization:** All itinerary items are automatically displayed as pins on an interactive map.

### 💸 **Shared Expense Tracking**
*   **Log Shared Expenses:** Any trip member can add an expense, including a description, amount, and who paid.
*   **Flexible Splitting:** Expenses can be split equally among all trip members or a custom subset of members.
*   **Real-Time Settlement Algorithm:** The app features a live-updating summary that calculates and displays a simplified "who owes whom" balance, eliminating confusion and making settlement easy.

### ☁️ **Backend & Notifications**
*   **Serverless Architecture:** The entire backend is powered by Firebase (Firestore, Auth, Storage, Functions), ensuring scalability and real-time capabilities.
*   **Push Notifications:** A deployed Firebase Cloud Function is triggered whenever a new place is added to a trip, sending a push notification to all other trip members (requires a development build to test).

---

## 🛠️ Tech Stack & Architecture

This project is a full-stack application leveraging a modern, serverless technology stack.

| Category | Technology |
| :--- | :--- |
| **Frontend** | React Native, Expo, TypeScript, Expo Router, React Native Elements, React Native Maps |
| **Backend** | Firebase (Cloud Functions for server-side logic) |
| **Database** | Firestore (NoSQL, Real-time) |
| **Authentication**| Firebase Authentication (Email/Password) |
| **File Storage** | Firebase Storage (for user-uploaded images) |
| **Third-Party APIs**| Google Places API |

### Architectural Highlights

*   **File-Based Routing with Expo Router:** Navigation is handled declaratively through the file system, including dynamic routes for trip details (`app/trip/[tripId].tsx`) and protected route groups for authentication flow.
*   **Real-Time Data Sync with Firestore:** The application heavily utilizes `onSnapshot` listeners from the Firebase SDK. This allows for a seamless, real-time collaborative experience where UI updates instantly for all users when data changes in the backend, with no need for manual refreshing.
*   **Serverless Backend Trigger:** The push notification system is a perfect example of a serverless, event-driven architecture. A Cloud Function is triggered by a Firestore `onCreate` event, running server-side logic without managing any servers.

---

## ⚙️ Setup & Installation

To run this project locally, you will need Node.js, an Expo Go account, and a Firebase account.

### 1. Prerequisites
*   Node.js (LTS version)
*   Expo CLI (`npm install -g expo-cli`)
*   Firebase CLI (`npm install -g firebase-tools`)

### 2. Clone the Repository
```bash
git clone https://github.com/[YOUR_GITHUB_USERNAME]/my-trip-planner-project.git
cd my-trip-planner-project
```

### 3. Frontend Setup (`collaborative-trip-planner`)
```bash
# Navigate into the app directory
cd collaborative-trip-planner

# Install dependencies
npm install

# [TODO: Add any other necessary setup steps, e.g., if you have an .env file]
```

### 4. Firebase Project Setup
1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Authentication:** Go to the "Authentication" section, click the "Sign-in method" tab, and enable the **Email/Password** provider.
3.  **Firestore:** Go to the "Firestore Database" section and create a new database. Start in **test mode** for development.
4.  **Storage:** Go to the "Storage" section and click "Get started."
5.  **Project Settings:** In your project settings, find your **Web App** configuration keys.

### 5. Configure Environment Variables
1.  In `src/api/firebase.ts`, replace the placeholder `firebaseConfig` object with your actual keys from the Firebase console.
2.  In `app/addPlace.tsx`, replace the placeholder `GOOGLE_PLACES_API_KEY` with your API key from the Google Cloud Console.
3.  In `app.json`, add your Expo Project ID under `extra.eas.projectId`.

### 6. Backend Setup (`functions`)
1.  Navigate into the `functions` directory: `cd ../functions`
2.  Install dependencies: `npm install`
3.  Connect to your project: `firebase use [YOUR_FIREBASE_PROJECT_ID]`
4.  Deploy the function: `firebase deploy --only functions`
    *   *Note: This requires upgrading your Firebase project to the Blaze (pay-as-you-go) plan, which has a generous free tier.*

### 7. Run the Application
```bash
# Navigate back to the app directory
cd ../collaborative-trip-planner

# Start the development server
npx expo start
```

---

## 🗺️ Future Improvements & Roadmap

This project has a strong foundation, but there are many exciting features that could be added:

*   **Robust Offline Mode:** Implement a local database like WatermelonDB to allow users to view and edit trip data even without an internet connection, with changes syncing automatically upon reconnection.
*   **Polished Animations:** Add shared element transitions and micro-interactions using `React Native Reanimated` to create a more fluid and engaging user experience.
*   **In-Trip Chat:** Add a real-time chat module for each trip to allow for easier communication between members.

---

## ⚖️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
