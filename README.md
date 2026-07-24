# SANNY Frontend

Modern React-based user interface for the SANNY AI travel assistant.

**Repositories**

- **Frontend:** Current repository
- **Backend:** https://github.com/miraleva/BackendS

---

## Overview

SANNY Frontend provides a conversational interface where users can search for hotels and flights using natural language, browse results through interactive cards, and complete reservations within a guided workflow.

The application includes:

- Conversational travel interface
- Hotel and flight search
- Interactive result cards
- Reservation workflow
- Multi-language user interface
- Responsive modern design

---

## Technology Stack

- React
- Vite
- Tailwind CSS
- React Router
- react-i18next
- react-phone-number-input
- Axios

---

## Design System

| Element | Value |
|---------|-------|
| Primary Color | `#0B5FFF` |
| Primary Dark | `#0A3FBF` |
| Accent Color | Orange / Amber |
| Fonts | Sora (body), Poppins (headings) |
| Border Radius | Cards: 20px, Buttons & Inputs: 12px |

---

## Project Structure

```
src/

├── components/
│   ├── ChatSidebar.jsx
│   ├── RightSidebar.jsx
│   ├── HotelDetailPanel.jsx
│   ├── ReservationFormPanel.jsx
│   ├── AppointmentDetailModal.jsx
│   └── LanguageSelector.jsx
│
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── ChatbotPage.jsx
│   ├── ProfilePage.jsx
│   ├── Settings.jsx
│   └── PastAppointments.jsx
│
├── services/
│   └── api.js
│
├── locales/
│   ├── en.json
│   ├── tr.json
│   ├── de.json
│   └── ru.json
│
└── i18n.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Running SANNY Backend instance

---

### Installation

Install project dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8083
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## User Workflow

The application guides users through the complete booking process.

```
Search
    ↓
AI Conversation
    ↓
Results
    ↓
Details
    ↓
Reservation
```

1. The user enters a hotel or flight request using natural language.
2. The backend collects any missing information through conversation.
3. Search results are displayed as interactive cards.
4. Selecting a result opens a centralized detail modal.
5. The reservation form is displayed within the same workflow.
6. Guest information is generated dynamically based on the selected travel criteria.

---

## Internationalization

The user interface supports:

- Turkish
- English
- German
- Russian

The interface language can be changed using the language selector.

The AI assistant independently detects the language of each user message and responds in the same language, regardless of the selected UI language.

Localization files are located under:

```
src/locales/
```

---

## State Management

The project intentionally avoids introducing a global state management library.

Instead, it relies on:

- **localStorage** for JWT tokens and cached user information
- **React useState** for component-level state
- **React Router state** for temporary navigation data (e.g., transferring selected hotel information to the reservation form)

---

## Backend Integration

The frontend communicates with the SANNY Backend through REST APIs using Axios.

Main integration areas include:

- User authentication
- AI chat
- Hotel search
- Flight search
- Reservation management
- User profile operations

JWT authentication is handled centrally through Axios interceptors.

---

## Related Repository

Backend source code:

https://github.com/miraleva/BackendS
