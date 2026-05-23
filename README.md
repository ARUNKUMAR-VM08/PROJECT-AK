# iframeyouu – Premium Personalized Gifts

**Live site:** https://iframeyouu.online

## Quick start (local development)

```bash
# Clone the repository (replace with your repo URL)
git clone <repo-url>
cd frame

# Frontend setup
cd frontend
npm install
npm run dev   # Vite dev server at http://localhost:5173
```

## Required environment variables (`VITE_*`)

| Variable | Description |
|----------|-------------|
| VITE_FIREBASE_API_KEY | Firebase API key |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase Auth domain |
| VITE_FIREBASE_PROJECT_ID | Firebase project ID |
| VITE_FIREBASE_STORAGE_BUCKET | Firebase storage bucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Firebase messaging sender ID |
| VITE_FIREBASE_APP_ID | Firebase app ID |
| VITE_CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| VITE_CLOUDINARY_UPLOAD_PRESET | Cloudinary unsigned upload preset |

## Deployment checklist

| ✅ | Item |
|---|------|
|[ ]| Vercel **Root Directory** set to `frontend` |
|[ ]| `frontend/vercel.json` present with correct config |
|[ ]| All `VITE_*` env vars set for **Production** and **Preview** |
|[ ]| Custom domain `iframeyouu.online` linked & DNS resolves |
|[ ]| Domain added to **Firebase Authorized Domains** |
|[ ]| Site loads without console errors |
|[ ]| SEO meta tags (`<title>`, description, single `<h1>`) present |
|[ ]| `.gitignore` excludes `node_modules/`, `.env*`, `dist/` |
|[ ]| README updated (this file) |
|[ ]| CI pipeline (GitHub Actions) passes lint, tests, and deploys |
