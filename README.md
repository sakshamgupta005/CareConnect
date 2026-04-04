<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CareConnect AI

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## WhatsApp Patient Bot (Baileys)

1. Set `.env` values:
   `VITE_WHATSAPP_HELP_NUMBER`, `VITE_SITE_URL`, and optionally `CARECONNECT_SITE_URL`.
2. Start the bot:
   `npm run whatsapp:bot`
3. Scan the QR code shown in terminal with the WhatsApp account that should act as the assistant.
4. In the app, tap `Open WhatsApp Help` from Patient Dashboard. The message starts with `START`, and the bot will:
   ask name, age, city, and main concern;
   answer basic CareConnect questions;
   send calm guidance plus website link promotion.
