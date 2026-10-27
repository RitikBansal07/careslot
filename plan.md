# PROJECT 1: CareSlot — Appointment Booking Demo (`plan.md`)

## 1. Project Overview & Goals
**CareSlot** is a polished, accessible appointment-booking mobile application built with React Native (Expo) and TypeScript. It is designed to run natively on iOS/Android and deploy as a responsive static web application on **GitHub Pages** via `react-native-web`.

### Core Objectives
- Demonstrate clean mobile UI/UX, accessible interactions, and type-safe navigation.
- Showcase resilient async state handling (loading skeletons, empty states, error retries) powered by an in-memory mock backend.
- Provide strong software engineering evidence: strict TypeScript contracts, decoupled service architecture (Adapter Pattern), form validation, and unit/component tests.

### Non-Goals (Guardrails)
- **No Real PHI/Medical Data:** Strictly synthetic provider profiles and non-clinical booking reasons.
- **No Real Payments:** Booking confirmation is immediate and simulated.
- **No External Backend Dependency:** 100% self-contained in the frontend bundle so the GitHub Pages deployment works out-of-the-box forever.

---

## 2. Tech Stack & Tooling

| Category | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Expo SDK (React Native + React Native Web) | Single codebase for iOS, Android, and static Web export for GitHub Pages. |
| **Language** | TypeScript (Strict Mode) | Enforces domain contracts, navigation params, and API payloads. |
| **Navigation** | Expo Router (or React Navigation v6/v7) | Type-safe routing, deep-linking, and clean web URL support (`hash` or `subdirectory` support for GH Pages). |
| **Server State** | TanStack Query (React Query v5) | Manages caching, loading/error states, and mutations over the mock service layer. |
| **Client State / Storage** | Zustand + `AsyncStorage` (`localStorage` on web) | Persists favorite providers, booked appointments, and "Chaos Mode" API debug settings. |
| **Forms & Validation** | React Hook Form + Zod | Declarative schema validation, accessible error announcements, and zero-boilerplate form state. |
| **Testing** | Jest + React Native Testing Library (RNTL) | Unit tests for Zod schemas/slot logic and integration tests for UI flows. |
| **Deployment** | GitHub Actions + `gh-pages` | Automated CI/CD pipeline exporting static web bundle (`npx expo export -p web`). |

---

## 3. Architecture & Folder Structure

```text
careslot/
├── .github/
│   └── workflows/
│       └── deploy-gh-pages.yml      # CI test runner + static web export to GH Pages
├── src/
│   ├── api/                         # Service Layer (Swappable Mock <-> HTTP)
│   │   ├── client.ts                # Interface contract (ICareSlotApi)
│   │   ├── mockApi.ts               # Mock implementation (latency, error simulation, local persistence)
│   │   ├── httpApi.ts               # Stubbed future REST implementation
│   │   ├── mockData.ts              # Seed data: 15+ providers, specialties, dynamic weekly slots
│   │   └── queries.ts               # TanStack Query hooks (useProviders, useProviderDetail, useBookSlot)
│   ├── components/
│   │   ├── ui/                      # Reusable primitives
│   │   │   ├── Button.tsx           # Accessible button with loading/disabled states
│   │   │   ├── TextInputField.tsx   # Form-connected input with error message & ARIA/a11y labels
│   │   │   ├── Chip.tsx             # Filter & time-slot pill component
│   │   │   └── ScreenState.tsx      # Unified Loading, Empty, and Error retry view wrapper
│   │   └── domain/
│   │       ├── ProviderCard.tsx     # List item with favorite toggle & next-available badge
│   │       ├── SlotPicker.tsx       # Date selector + grouped morning/afternoon time slots
│   │       └── DebugToolbar.tsx     # Floating/header toggle to force Loading/Empty/Error states
│   ├── screens/
│   │   ├── ProviderListScreen.tsx   # Search, specialty filter, favorites filter, provider list
│   │   ├── ProviderDetailScreen.tsx # Bio, location, interactive SlotPicker, "Continue" CTA
│   │   ├── BookingFormScreen.tsx    # Patient info form (Name, Email, Phone, Reason, Insurance)
│   │   ├── ConfirmationScreen.tsx   # Booking summary receipt, calendar export stub, back to home
│   │   └── FavoritesScreen.tsx      # Saved providers & upcoming booked appointments tab
│   ├── store/
│   │   ├── useFavoritesStore.ts     # Persisted favorite provider IDs
│   │   └── useDebugStore.ts         # Controls mock latency (ms) and simulated failure rate
│   ├── types/
│   │   ├── domain.ts                # Provider, TimeSlot, BookingRequest, BookingConfirmation
│   │   └── navigation.ts            # RootStackParamList & screen prop types
│   └── utils/
│       ├── validation.ts            # Zod schemas for booking form
│       └── dateHelpers.ts           # Relative dates ("Today", "Tomorrow") so demo slots never expire
├── __tests__/
│   ├── validation.test.ts           # Unit tests for Zod booking form rules
│   ├── SlotPicker.test.tsx          # Component tests for selecting/deselecting available vs booked slots
│   └── BookingFlow.test.tsx         # Integration test for form submission & error handling
├── app.json                         # Configured with experiments.baseUrl for GitHub Pages
└── package.json