# IFRAMEYOUU Mobile App (Expo & React Native)

This is the official mobile application for **IFRAMEYOUU** built with React Native and Expo, featuring a premium personalized gift shopping experience, role-based admin dashboard, and modern design.

## Features

- 📱 **Premium UI/UX:** Tailored HSL color palette, smooth custom micro-animations, full dark mode, and premium typography using Inter.
- 🛍️ **Comprehensive E-Commerce:** Product listings, detail views, responsive search, persistent cart, and orders tracking.
- 🔒 **Secure Auth:** Firebase Authentication integration.
- 👑 **Admin Dashboard:** Role-based access control for managing catalog (Create, Read, Update, Delete products).
- 🧪 **Solid Testing:** Preset with `jest-expo` for flawless local and CI testing.

---

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and the Expo CLI installed.

### Setup Instructions

1. **Navigate to the directory**:
   ```bash
   cd mobile-expo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `mobile-expo` root folder:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the Development Server**:
   ```bash
   npm start
   ```
   Press `a` to run on Android emulator or `i` to run on iOS simulator.

---

## Testing

Jest is configured with `jest-expo`. All mock-related warnings and Reanimated errors have been fully resolved.

To run the unit and integration tests:
```bash
npm test
```

---

## Admin Access & Creation

Admin features are only accessible to accounts that:
1. Have an email ending in `@admin.com`
2. Match the specific master admin email `arunkumarravi.mv@gmail.com`

### Creating an Admin User
To provision a new admin user programmatically:
1. Navigate to the `backend/` directory of the project.
2. Configure your Firebase environment variables.
3. Run the admin provisioning script:
   ```bash
   node createAdminUser.cjs --email="newadmin@admin.com" --password="securepassword"
   ```

---

## Production Builds

Build scripts are defined in `package.json` and are fully integrated with EAS (Expo Application Services).

### Local & EAS Build Commands

- **Build for Android (.apk/.aab)**:
  ```bash
  npm run build:android
  ```
- **Build for iOS (.ipa)**:
  ```bash
  npm run build:ios
  ```
- **Build all platforms via EAS**:
  ```bash
  npm run build:eas
  ```

### Automated CI Production Builds

A production build job is configured in GitHub Actions (`.github/workflows/ci.yml`). 
Whenever a version tag matching `v*` (e.g., `v1.0.0`) is pushed to the repository, the `mobile-build-prod` workflow is triggered:
1. Checks out the code.
2. Inject Vercel/Expo secrets from GitHub Secrets.
3. Triggers the production-grade EAS build (`npm run build:eas`).
4. Uploads the generated mobile binaries as a workflow artifact named `expo-build`.
