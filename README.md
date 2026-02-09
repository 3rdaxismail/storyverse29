# Storyverse - Writing Session Platform

A production-ready writing application with advanced session management, built from Figma design with pixel-perfect accuracy.

## 🎯 Features

- **Writing Session Engine**: Centralized content management with undo/redo, debounced autosave, and word-safe persistence
- **Editor States**: Dynamic UI states (empty, idle, focused, typing, selection, disabled, readOnly)
- **Keyboard Shortcuts**: Cmd+Z/Ctrl+Z for undo, Cmd+Shift+Z/Ctrl+Y for redo
- **Autosave**: Automatic save with 2-second debounce after last edit
- **Figma-Driven Design**: All design tokens extracted from Figma, zero hardcoded values
- **Mobile-First**: Responsive design matching Figma breakpoints (375px, 834px, 1440px)

## 🚀 Quick Start

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## 📚 Documentation

See [COMPONENTS.md](./COMPONENTS.md) for complete component documentation.

## Development

Run locally:

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

## Testing State Transitions

1. **Loading → Empty**: Initial load shows loading skeleton (1s) then transitions to empty state
2. **Empty → Writing**: Click the textarea to enter writing state
3. **Writing → Idle**: Type text and stop for 2 seconds to see idle state with "Saved" indicator
4. **Idle → Syncing**: Auto-save triggers syncing state (500ms) then returns to idle
5. **Idle/Writing → Offline**: Toggle network offline in DevTools to see offline indicator
6. **Offline → Idle**: Toggle network back online to restore idle state
7. **Loading → Error**: Refresh during offline or simulate 10% error rate on load, click "Reload" to retry

## Technology Stack

- React 18
- TypeScript
- Vite
- CSS Animations
