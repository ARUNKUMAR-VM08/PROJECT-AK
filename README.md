# Gift Boutique eCommerce Platform

A premium, highly responsive, and modular gift eCommerce application built with a modern frontend and backend separation. 

This platform features a beautiful, micro-animated HSL cute boutique aesthetic (soft warm creams, dust rose accents, and clean shadow depths), paginated product searches, WhatsApp order receipt auto-filling, UPI QR scan drawer payments, and a future-ready Razorpay checkout integration overlay.

---

## 📂 Repository Structure

The codebase is split into two cleanly separated directories to ensure deployment hygiene and clear environment separation:

```
project-root/
├── frontend/             # Single-Page React Application
│   ├── src/
│   │   ├── assets/       # Visual brand assets and custom illustrations
│   │   ├── components/   # Reusable UI widgets (Header, ProductCard, Skeletons, SEO)
│   │   ├── context/      # Global states (AuthContext, CartContext, WishlistContext)
│   │   ├── hooks/        # Custom hooks (e.g. useRazorpay script injector)
│   │   ├── pages/        # Storefront views (Home, Shop, ProductDetails, Cart, Checkout, Orders)
│   │   ├── admin/        # Protected admin layouts (Dashboard, ManageProducts)
│   │   ├── services/     # Client services (firebase configurations, database CRUD, and seeders)
│   │   └── utils/        # System utilities (validators, centralized constants, formatters)
│   ├── public/           # Static icons & SEO files
│   ├── .env.example      # Client environment template
│   ├── vite.config.js    # Highly optimized Rollup chunking rules
│   └── vercel.json       # High-performance SPA routing and asset caching configurations
│
├── backend/              # Serverless Security Configurations & Admin SDK scripts
│   ├── admin-scripts/    # Node CLI tools (setAdmin custom claims, database seeder)
│   ├── cloud-functions/  # Placeholders for future serverless endpoints
│   ├── firebase/         # Firebase local deployment assets
│   ├── firestore.rules   # Strict access rules & transaction schema validators
│   ├── firebase.json     # Multi-resource deploy maps
│   └── .env.example      # Admin service credentials template
│
└── README.md             # This unified guide
```

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) (v18+ recommended) and `npm` installed.

### 2. Frontend Configuration & Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template and populate it with your client Firebase Config credentials:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
5. Build the optimized production bundle:
   ```bash
   npm run build
   ```

### 3. Cloudinary Configuration
This platform utilizes **Cloudinary** (free tier) for product image uploads to keep the project completely free without needing Firebase's paid Blaze plan:
1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. In your Cloudinary Dashboard, navigate to **Settings** -> **Upload** -> **Upload presets**.
3. Click **Add upload preset**, name it, and set the **Signing Mode** to **Unsigned**.
4. In your `frontend/.env` file, populate the following variables:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name_here
   ```

### 4. Backend Administrative Scripts Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd ../backend
   ```
2. Install server dependency utilities:
   ```bash
   npm install
   ```
3. Generate a Firebase Service Account key:
   - Go to your **Firebase Console** -> **Project Settings** -> **Service Accounts**.
   - Click **Generate new private key** and save the resulting JSON file.
4. Copy the backend environment template and populate it using the values from your service account JSON file:
   ```bash
   cp .env.example .env
   ```

---

## 🛠️ Administrative CLI Tools

The `backend/` workspace provides advanced, server-safe CLI scripts using the standard `firebase-admin` SDK.

### Database Seeder
Seeds both the `categories` and `products` collections in Firestore with standard structured mock items (including features, tags, ratings, and customizations prompts):
```bash
npm run seed-db
```

### Elevation of User Roles (Custom Claims)
Elevates any registered user account to the `'admin'` role. This script triggers dual-layer security, applying custom claims (`{admin: true}`) on their Auth token and updating their corresponding Firestore user document field:
```bash
# Usage: npm run set-admin <email_or_uid> [true/false]
npm run set-admin admin@iframeyouu.in true
```

---

## 🔒 Security Architectures

Security rules are managed under the `backend/` folder and deployed directly to the Cloud:

### Firestore Security (`backend/firestore.rules`)
- **Isolation**: Standard users can only view or write their own profiles and their own order lists.
- **Verification**: Guest order creations are allowed to accommodate fast user checking, but modifying order properties once created is blocked unless accessed by an authenticated `'admin'`.
- **Product Safety**: Inventory catalog updates are restricted strictly to accounts possessing the `admin` custom claim on their Firestore-linked token.

To deploy rules to your live project:
```bash
# Install Firebase CLI globally if not already present
npm install -g firebase-tools

# Login and deploy rules from within the backend directory
firebase login
firebase deploy --only firestore:rules
```

---

## 📦 WhatsApp Order Auto-Fill & Payments

The checkout experience leverages multiple robust payment gateways:
1. **WhatsApp Checkout**: Generates a standard formatted checkout payload. Upon submission, it triggers the WhatsApp Web/App redirect (with no spaces/invalid URI breaks) prepopulated with shipping parameters, customizations, and items list so that the customer can coordinate photo printings immediately.
2. **UPI Scan Drawer**: Provides AXIS bank UPI mapping, generating a clean QR display box and prompting for the transaction reference ID, locking duplicate-order creations until verified.
3. **Razorpay Gateway**: Reusable payment overlay module (`frontend/src/hooks/useRazorpay.js`) which dynamically loads the Razorpay SDK script inside React lifecycle hooks, validates transactions, and posts automatic update flags back to Firestore.

---

## 📤 Production Deployment Pipelines

### Client App (e.g. Vercel)
The React/Vite application is fully optimized for single-page routing and cached delivery:
- `frontend/vercel.json` intercepts client refreshes (rerouting back to `index.html`) to prevent standard React Router 404 breaks, and injects immutable headers for assets.
- Build configuration (`frontend/vite.config.js`) splits major vendor weights (Firebase, Framer Motion, and Lucide Icons) into separate cached files.

### CI/CD Ready Project Structure
For GitHub Actions or GitLab CI, wire your build stages with these steps:
```yaml
# Build Client Artifacts
- name: Install Frontend
  run: npm ci
  working-directory: ./frontend
- name: Build Frontend
  run: npm run build
  working-directory: ./frontend
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    # ... other environment secrets ...
```

---

## 💾 Firebase Database Backups & Exports Guidance

To prevent data loss and ensure operational safety, set up automatic backups of your Firestore database.

### Prerequisites
1. **Blaze Plan**: Backups require the pay-as-you-go Blaze pricing tier (required by Google Cloud Storage integration).
2. **Google Cloud CLI**: Install the Google Cloud CLI (`gcloud`) on your machine.
3. **Google Cloud Storage (GCS) Bucket**: Create a backup bucket in your Firebase project's storage.

### Manual Backup (CLI)
1. Initialize the Google Cloud SDK:
   ```bash
   gcloud init
   ```
2. Run the export command to save your entire Firestore database to your storage bucket:
   ```bash
   gcloud firestore export gs://YOUR_BACKUP_BUCKET_NAME
   ```
3. To backup a specific collection (e.g., `orders`):
   ```bash
   gcloud firestore export gs://YOUR_BACKUP_BUCKET_NAME --collection-ids=orders
   ```

### Scheduled Automatic Backups (Recommended)
You can automate backups on a daily schedule using **Google Cloud Scheduler** and **Cloud Functions**:
1. Enable the **Cloud Scheduler API** in your Google Cloud Console.
2. Create a GCS bucket dedicated to daily backups (e.g. `gs://your-project-firestore-backups`).
3. Deploy a serverless cloud function (or use the Google Cloud SDK Cron scheduler) to trigger the export endpoint on a recurring schedule.
4. Set the Cron schedule (e.g. `0 2 * * *` triggers the export every day at 2:00 AM).
