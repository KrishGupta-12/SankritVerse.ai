# **App Name**: SanskritVerse AI

## Core Features:

- AI-Powered Verse Analysis: Analyze Sanskrit verses using Gemini API (or HuggingFace Sanskrit Parser) via a Cloud Function, returning transliteration, word meanings, grammar tags, and English translation.
- Sanskrit Text-to-Speech: Enable users to hear the correct Sanskrit pronunciation of verses using the Google Text-to-Speech API.
- Verse Input & Scanning: Allow users to input Sanskrit verses via text or scan them using camera OCR.
- Personal Verse Library: Enable users to save their favorite verses to a personal library, organized within their user profile.
- Shloka of the Day: Present a daily verse with its interpretation and meaning, fetched from Firestore using a timestamp-based query. Use AI as a tool to determine the best matching Shloka given user interaction, for maximum personal relevance.
- User Authentication: Implement Firebase Authentication for user login/signup (Email + Google Sign-In).
- Verse Sharing: Allow users to share verses via WhatsApp or Instagram, including verse image and meaning.

## Style Guidelines:

- Primary color: Saffron (#FF9933) to evoke traditional and spiritual feelings.
- Background color: Cream (#FFF5E0), a desaturated version of saffron, providing a soft and calming backdrop.
- Accent color: Gold (#D4AF37), analogous to saffron, will highlight interactive elements and add a luxurious touch.
- Headline font: ‘Samarkan’ for titles (decorative Devanagari-like font).
- Body font: ‘Noto Sans Devanagari’ for content (Devanagari Unicode compatible).
- Mandala-inspired rounded icons to maintain the spiritual theme.
- Smooth transitions and animations (MotionLayout or Lottie) for a modern feel.