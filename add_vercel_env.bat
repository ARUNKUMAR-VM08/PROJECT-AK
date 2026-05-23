@echo off
rem ------------------------------------------------------------
rem  Add Vercel environment variables for Production and Preview
rem  Run this file from the project root (c:\Users\MONICA SRI\Desktop\frame)
rem ------------------------------------------------------------

rem ---- Production ----
(echo Ai... ) | vercel env add VITE_FIREBASE_API_KEY production
