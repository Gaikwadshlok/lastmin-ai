# LastMin AI

AI-powered study assistant platform built with React 19, Vite, Tailwind CSS, Radix UI primitives, and React Query.

## Core Features

- Authentication (register, login, logout) with token persistence
- First-visit animated loader with Framer Motion
- Protected routes (Dashboard, Syllabus, Ask AI, Quiz) via `ProtectedRoute`
- Global error boundary for resilience
- AI services: chat, document analysis, summaries, quiz generation
- Quiz, Notes, Upload, and Auth service layers (Axios + interceptors)
- React Query hooks (`useQuizzes`, `useNotes`, `useAIChat`)
- Rich UI component library & cosmic theme

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Core | React 19, Vite |
| Styling | Tailwind CSS, Radix UI, custom components |
| State (server) | React Query |
| State (auth) | Context API + localStorage |
| Animations | Framer Motion |
| HTTP | Axios + interceptors |

## Project Structure

```
src/
   App.jsx
   components/
      Loader.jsx
      ProtectedRoute.jsx
      ErrorBoundary.jsx
   contexts/AuthContext.jsx
   services/ (auth, ai, quiz, notes, upload)
   hooks/ (useQuizzes.js, useNotes.js, useAIChat.js, use-toast.js)
   config/ (api.js, env.js)
   pages/ (Index.jsx, Login.jsx, Signup.jsx, Dashboard.jsx, Syllabus.jsx, AskAI.jsx, Quiz.jsx, NotFound.jsx)
   lib/ (utils.js)
```

## Environment Variables

Create `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```
Restart dev server after changes.

## Getting Started

```powershell
npm install
npm run dev
```
Visit: http://localhost:5173

### Scripts
- dev: Start dev server
- build: Production build
- preview: Preview build
- lint: ESLint

## Auth Flow
1. User logs in / signs up (`AuthContext`)
2. Token + user saved to localStorage
3. Interceptors attach token
4. 401 clears storage & redirects to /login

## Protected Routes
Wrap a page in `<ProtectedRoute>`. Unauthenticated users are redirected.

## Error Handling
`ErrorBoundary` wraps routes; offers reload/dismiss.

## React Query Usage
Hooks encapsulate fetching and caching. Extend them as needed.

## Future Enhancements
- Add Vitest + RTL tests
- Theme toggle + persistence
- Optimistic updates for notes/quizzes
- Pagination & infinite scroll
- Accessibility review

## License
Internal / Proprietary (update if open sourcing).

---
Made for efficient, last-minute learning. 🚀

## Responsive Behavior
- **Tablet**: Optimized layout with icon navigation
- **Mobile**: Hamburger menu with touch-friendly interface

## 🎯 User Experience

### 🔄 **Loading Experience**
- Character-by-character animated loading screen
- Smooth transitions between pages
- Progressive content loading

### 🎨 **Visual Design**
- Cosmic theme with space-inspired elements
- Purple and blue gradient accents
- Glass morphism effects
- Consistent spacing and typography

### ⚡ **Performance**
- Optimized bundle size with Vite
- Lazy loading for better performance
- Smooth animations with Framer Motion

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Base UI components (Radix)
│   ├── Header.jsx       # Navigation header
│   ├── HeroSection.jsx  # Homepage hero
│   ├── Loader.jsx       # Loading screen
│   └── ...
├── pages/               # Application pages
│   ├── Index.jsx        # Homepage
│   ├── Login.jsx        # Authentication
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Syllabus.jsx     # File management
│   ├── AskAI.jsx        # AI chat
│   └── Quiz.jsx         # Quiz system
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication state
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── main.jsx             # Application entry point
```

## 🎨 Customization

### Theme Configuration
The project uses a custom Tailwind configuration with:
- Extended color palette for cosmic theme
- Custom spacing scale
- Responsive breakpoints
- Custom component variants

### Component System
- Modular component architecture
- Consistent component patterns
- Plain JavaScript and JSX modules for simplicity
- Reusable UI patterns

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Project

LastMin AI was created for **PixxelHacks** hackathon, showcasing:
- Modern web development practices
- AI integration concepts
- User-centered design
- Full-stack application architecture

## 🔮 Future Enhancements

- [ ] AI model integration for real content generation
- [ ] Multi-language support
- [ ] Collaborative study features
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with popular LMS platforms

## 👥 Team

Built with ❤️ by the LastMin AI team for PixxelHacks.

---

**Made for students, by students.** 🎓✨
