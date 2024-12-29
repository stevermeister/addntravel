# addntravel.com: Personal Travel Planner

<img width="1219" alt="Screenshot 2024-12-21 at 14 59 30" src="https://github.com/user-attachments/assets/3ac82879-fef6-4d99-a45b-6312f4c42e33" />

A modern web application designed to help travelers organize and plan their dream destinations. Built with React and Firebase, it offers a seamless experience for managing your travel wishlist with features like smart destination cards, interactive calendar integration, and AI-powered suggestions.

## Features

- 🏷 **Smart Destination Cards**: Organize trips with tags, duration, season preferences, and budget estimates
- 📅 **Interactive Calendar**: Match destinations with your available time and holidays
- 🤖 **AI-Powered Suggestions**: Get personalized travel recommendations powered by Google Gemini
- 🔥 **Real-time Updates**: Firebase integration for instant data synchronization
- 🎨 **Modern UI/UX**: Clean, responsive interface built with TailwindCSS
- 🔒 **Secure Authentication**: Google account integration for personalized experience

## Project Structure

```
addntravel/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Main application pages
│   ├── utils/            # Helper functions and utilities
│   ├── hooks/            # Custom React hooks
│   └── App.jsx           # Main application component
├── public/               # Static assets
├── scripts/             # Build and deployment scripts
└── dist/                # Production build output
```

## Technology Stack

### Core

- **React** (v19) - Frontend framework
- **Vite** (v6) - Build tool and development server
- **TailwindCSS** (v3) - Utility-first CSS framework
- **React Router** (v7) - Client-side routing

### Backend Services

- **Firebase**
  - Authentication (Google Sign-in)
  - Realtime Database
  - Hosting

### Development Tools

- **Sharp** - Image optimization
- **PostCSS** - CSS processing
- **Lodash** - Utility functions

## Setup and Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

## Deployment

The application is automatically deployed to Firebase Hosting on push to the main branch. Manual deployment:

```bash
npm run build
firebase deploy
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

Made with ❤️ for travelers
