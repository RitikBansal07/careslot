# CareSlot — Modern Appointment Booking Demo

**CareSlot** is a mobile and responsive web application built with **React Native (Expo SDK)**, **TypeScript (Strict Mode)**, **React Navigation**, **TanStack Query**, and **Zustand**. It demonstrates mobile UX, accessible interactions, resilient async state handling, and decoupled service architecture.

---

## 🚀 Key Features

- **Provider Directory**: Browse 15+ synthetic medical providers across 9 specialties with instant search, specialty filtering, distance calculations, and real-time availability badges.
- **Dynamic Slot Generation**: Relative rolling date system (`Today`, `Tomorrow`, +5 days) ensuring appointment slots never expire.
- **Accessible Booking Flow**:
  - Horizontal calendar date selector with morning & afternoon grouped slots.
  - Distinct visual styling and ARIA/a11y labels for available vs booked slots.
  - Comprehensive booking form validated with **React Hook Form + Zod**.
- **Official Booking Receipt**: Confirmation screen with booking reference ID, patient summary, and one-click **Add to Calendar** (`.ics` iCalendar export).
- **Personal Health Hub**: Tab to review active bookings (with cancellation workflows) and starred favorite providers persisted in **AsyncStorage** (`localStorage` on Web).
- **Chaos & Demo Toolbar**: Floating control modal allowing evaluators to simulate:
  - Custom network latency (150ms, 350ms, 1500ms).
  - Simulated network failure rates (0%, 50%, 100%) to test error recovery and retry buttons.
  - Forced Skeleton Loading and Empty State toggles.

---

## 🛠️ Architecture

```text
careslot/
├── .github/
│   └── workflows/
│       └── deploy-gh-pages.yml      # CI test runner + static web export to GH Pages
├── src/
│   ├── api/                         # Service Layer (Adapter Pattern)
│   │   ├── client.ts                # ICareSlotApi interface contract
│   │   ├── mockApi.ts               # In-memory mock implementation with latency & error simulation
│   │   ├── httpApi.ts               # Stubbed REST implementation demonstrating swapability
│   │   ├── mockData.ts              # 15+ providers across 9 specialties with dynamic 7-day slots
│   │   └── queries.ts               # TanStack Query hooks (caching, invalidation, mutations)
│   ├── components/
│   │   ├── ui/                      # Reusable accessible primitives (Button, TextInputField, Chip, ScreenState)
│   │   └── domain/                  # ProviderCard, SlotPicker, DebugToolbar
│   ├── screens/                     # ProviderList, ProviderDetail, BookingForm, Confirmation, Favorites
│   ├── store/                       # useFavoritesStore (persisted) & useDebugStore (chaos controls)
│   ├── types/                       # domain.ts & navigation.ts
│   └── utils/                       # validation.ts (Zod) & dateHelpers.ts
└── __tests__/                       # Jest & React Native Testing Library test suites
```

---

## 🧪 Testing & Verification

Run the comprehensive unit, component, and integration test suite:

```bash
npm test
```

Run TypeScript strict type-checking:

```bash
npx tsc --noEmit
```

Build the static web bundle for GitHub Pages deployment:

```bash
npm run export:web
```

---

## 💻 Running Locally

### Start Web Version:
```bash
npm run web
```

### Start iOS / Android with Expo Go:
```bash
npm start
```

