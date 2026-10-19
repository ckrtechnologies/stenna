# Stenna Wallpaper Enterprise — Sales Boy Field App (`app_salesboy`)
## Mobile Solution Architecture & Screen-by-Screen Specification (Doc S-01)

- **Author**: Senior Software Architect — CKR Technologies (Greater Noida, India)
- **Client**: Stenna Wallpaper Enterprise
- **Platform**: React Native Bare CLI (Android & iOS)
- **Status**: Ready for Implementation
- **Version**: 1.0.0 (October 2026)

---

## 1. Architectural Stack & CKR Non-Negotiables

| Layer | House Standard | Rules & Constraints |
|---|---|---|
| **Framework** | **React Native (Bare CLI)** | Latest stable (0.82+ New Architecture/Fabric enabled). |
| **Language** | **JavaScript only (.js / .jsx)** | **Strictly NO TypeScript** (`.ts/.tsx`, `tsconfig.json`, `@types/*` are banned). |
| **Architecture** | **Domain-Driven Design (DDD)** | Feature-driven structure: `src/features/<feature>/screens`, `components/`, `api/`, `theme/`. |
| **Screen Constraint** | **Modular Single Screen** | **Strictly ONE screen per file**, capped at ~200–250 lines (zero monoliths). |
| **State Management** | **Redux Toolkit + RTK Query** | RTK Query for server cache + offline mutation queue. |
| **Styling** | **Vanilla StyleSheet + Theme Tokens** | Per-domain `src/theme/` tokens. **NO NativeWind, NO Tamagui**. |
| **Environment** | **Single Base Variable** | `API_BASE_URL` in mobile `.env` (points to `http://<ip>:5010/api/v1`). |
| **Design Language** | **CKR Enterprise System** | Tabler Icons, custom floating sheets, vibrant primary tokens, universal mobile scrollbar suppression. |
| **Indian Context** | **Standard Local Formatting** | Currency **₹**, phone `+91`, dates **12 Mar 2026**, times **4:30 PM**. |

---

## 2. Information Architecture (IA) & Navigation Tree

```
RootNavigator (Stack)
├── [Public / Auth Flow]
│   ├── S-01: SplashScreen (Auto-login & connectivity gate)
│   └── S-02: LoginScreen (Phone + Password authentication)
│
└── [Protected / Main App Flow] -> MainBottomTabs
    ├── Tab 1: Field Dashboard (S-03)
    ├── Tab 2: Retail Shops Directory (S-04)
    ├── Tab 3: Field Visits Ledger (S-09)
    └── Tab 4: Sales Rep Profile & Offline Sync (S-10)
    │
    └── [Modal Stack / Drilldown Flows]
        ├── S-05: ShopDetailScreen (360° shop intel & audit history)
        ├── S-06: RecordVisitScreen (Fast 30-sec field check-in form)
        ├── S-07: BookPickerModal (Catalog pitch vs bought multi-selector)
        └── S-08: VisitSuccessScreen (Submission receipt & sync status)
```

---

## 3. Screen-by-Screen Detailed Specification

### Screen S-01: Splash & Session Check
- **File**: `src/features/auth/screens/SplashScreen.jsx`
- **Navigation Route**: `Splash`
- **Purpose**: Verify saved JWT session, check offline storage integrity, and route to Dashboard or Login.
- **UI Components**:
  - Centered brand emblem (`Stenna Wallpaper` logo + *"It's Time For Wallpapers"* slogan).
  - Subtle animated loading progress bar.
  - App build watermark: `v1.0.0 (Build 101) • Stenna Enterprise`.
- **Logic**:
  - Read `@stenna_token` and `@stenna_user` from `AsyncStorage`.
  - If token exists: dispatch `setCredentials()`, verify token with `GET /sales-tracking/app/dashboard`, navigate to `MainTabs`.
  - If token absent or invalid: navigate to `Login`.

---

### Screen S-02: Sales Rep Login
- **File**: `src/features/auth/screens/LoginScreen.jsx`
- **Navigation Route**: `Login`
- **Purpose**: Secure 10-digit mobile number + password sign-in for field executives.
- **UI Components**:
  - Top header hero banner with subtle dark wallpaper texture.
  - Title: **"Field Representative Login"**.
  - Subtitle: *"Enter your registered 10-digit mobile number to access your territory beat."*
  - **Phone Input**: Fixed `+91` flag badge prefix, 10 numeric digits, auto-focus.
  - **Password Input**: Secure text entry with show/hide toggle icon (`IconEye` / `IconEyeOff`).
  - **CTA Button**: Full-width primary button **"Sign In to Territory"** with active spinner.
  - Help text: *"Forgot credentials? Contact your Territory Sales Manager."*
- **API Endpoint**: `POST /api/v1/sales-tracking/auth/login`
  - **Payload**: `{ "phone": "9811223344", "password": "••••••" }`
  - **Response**: `{ "token": "jwt...", "user": { "id", "name", "phone", "role", "assignedZoneIds" } }`

---

### Screen S-03: Field Sales Dashboard (Home)
- **File**: `src/features/dashboard/screens/DashboardScreen.jsx`
- **Navigation Route**: `MainTabs -> Dashboard`
- **Purpose**: Daily operational command center showing shift KPIs, visit progress, and quick action trigger.
- **UI Components**:
  1. **Top Greeting Bar**:
     - Sales Rep avatar & name (`Sunil Verma`).
     - Territory badge (`"Zone: South Delhi & Noida"`).
     - Network status indicator pill (`Online` / `Offline Mode: 2 queued`).
  2. **Today's Field Performance Card** (Vibrant gradient container):
     - **Visits Completed**: Large bold counter (`12 Visits`).
     - Available / Closed split: `10 Open` · `2 Closed`.
     - **Books Pitched**: Counter (`24 Pitched`).
     - **Books Converted / Ordered**: Highlighted green counter (`6 Ordered / 25% Conv.`).
  3. **High-Priority Action**:
     - Prominent floating action button: **"+ Log Shop Visit"** (triggers S-06).
  4. **Daily Beat Plan Target**:
     - Progress bar: *"12 of 18 Target Shops visited today (67%)"*.
  5. **Recent Field Activity Feed**:
     - Last 3 visited shops with status chip, timestamp, and books summary.
- **API Endpoint**: `GET /api/v1/sales-tracking/app/dashboard`

---

### Screen S-04: Assigned Retail Shops Directory
- **File**: `src/features/shops/screens/ShopsDirectoryScreen.jsx`
- **Navigation Route**: `MainTabs -> Shops`
- **Purpose**: Searchable, territory-filtered directory of all retail wallpaper stores assigned to this rep.
- **UI Components**:
  1. **Search Header**:
     - Real-time search input with clear button (filters shop name, owner name, phone, address).
  2. **Filter & Status Tabs**:
     - Tabs: **"All Shops (142)"** · **"Visited Today (12)"** · **"Pending Beat (130)"**.
     - Territory Zone chip filter (for reps covering multiple zones).
  3. **Shop Card Item**:
     - **Shop Name**: Bold font (`"Classic Home Interiors"`).
     - **Owner & Phone**: Contact person with 1-tap call button (`IconPhoneCall`).
     - **Address**: Locality and street address.
     - **Audit Badge**: `"Visited 2 days ago"` or `"Never Visited"`.
     - **Conversion Tag**: Chip displaying number of catalog books onboarded.
  4. **Card Action**:
     - **"Check-In"** button (pre-selects this vendor and opens S-06).
- **API Endpoint**: `GET /api/v1/sales-tracking/vendors?zoneIds=...`

---

### Screen S-05: Shop 360° Profile & Audit Ledger
- **File**: `src/features/shops/screens/ShopDetailScreen.jsx`
- **Navigation Route**: `ShopDetail` (params: `{ vendorId }`)
- **Purpose**: Complete historical intelligence on a shop before the sales rep walks in.
- **UI Components**:
  1. **Store Header Card**:
     - Shop name, territory zone, owner name, phone number, complete address.
     - Action buttons: **Call Shopkeeper**, **Google Maps Directions**.
  2. **Catalog Books Portfolio**:
     - **Books Active in Store (Bought)**: Green chips with book name and catalog code.
     - **Books Pitched in Past (Unconverted)**: Purple chips with date shown.
     - **New Books Not Yet Shown**: Highlighted opportunity badges ready for pitching.
  3. **Past Visits History Timeline**:
     - Chronological timeline of all past field rep visits (dates, notes, shopkeeper feedback).
  4. **Bottom Sticky Action**:
     - Full-width button: **"Start Field Visit at this Shop"**.
- **API Endpoint**: `GET /api/v1/sales-tracking/vendors/:id/history`

---

### Screen S-06: Log New Visit (Field Check-In Form)
- **File**: `src/features/visits/screens/RecordVisitScreen.jsx`
- **Navigation Route**: `RecordVisit` (params: `{ vendorId? }`)
- **Purpose**: 30-second rapid field visit submission form designed for mobile ergonomics.
- **UI Components**:
  1. **Selected Shop Selector**:
     - Shop card preview with "Change Shop" action if opened without pre-selection.
  2. **Shop Availability Status Toggle** (Large Dual-Segment Button):
     - **[ ✓ Store Open & Available ]** (Vibrant green border & fill).
     - **[ ✕ Store Closed / Owner Unavailable ]** (Amber border & fill).
  3. **Catalog Books Section** (Visible when store is Open):
     - **Books Pitched (Shown)** summary trigger (`"3 Books Selected >"`).
     - **Books Bought (Orders)** summary trigger (`"1 Book Ordered >"`).
     - Tapping opens `BookPickerModal` (`S-07`).
  4. **Field Notes & Remarks**:
     - Quick tag chips: `[Requested new collection]`, `[Stock low]`, `[Payment discussion]`, `[Owner busy - callback]`.
     - Multi-line text field for custom comments.
  5. **Submit Action**:
     - **"Submit & Complete Visit"** (Full-width CTA button).
- **API Endpoint**: `POST /api/v1/sales-tracking/app/visits`
  - **Payload**:
    ```json
    {
      "vendorId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "isAvailable": true,
      "comments": "Showed new velvet collection; ordered 1 sample book.",
      "booksShown": ["book-uuid-1", "book-uuid-2"],
      "booksBought": ["book-uuid-1"]
    }
    ```

---

### Screen S-07: Catalog Book Pitch & Order Selector
- **File**: `src/features/visits/components/BookPickerModal.jsx`
- **Navigation Route**: Modal Popover inside S-06
- **Purpose**: Multi-selection matrix allowing the rep to mark which wallpaper books were pitched and which were ordered.
- **UI Components**:
  - Search bar to filter catalog books by name or SKU code.
  - Scrollable catalog book rows with thumbnail covers.
  - Two intuitive pill toggles per book row:
    - **[ + Pitched ]** (Purple toggle)
    - **[ ★ Bought / Order ]** (Green toggle)
  - Business Rule: Selecting "Bought" automatically flags "Pitched".
  - Floating bottom summary bar: *"3 Pitched · 1 Ordered"* with **"Confirm Selection"** button.

---

### Screen S-08: Visit Success & Sync Receipt
- **File**: `src/features/visits/screens/VisitSuccessScreen.jsx`
- **Navigation Route**: `VisitSuccess`
- **Purpose**: Positive confirmation receipt showing visit details and online/offline sync status.
- **UI Components**:
  - Green animated checkmark (`IconCheckCircle`).
  - Heading: **"Visit Recorded Successfully!"**
  - Receipt Card:
    - Shop Name, Visit Timestamp (`19 Oct 2026, 11:25 AM`).
    - Status: Available.
    - Books Pitched list & Books Converted list.
    - Sync status tag: `"Synced to Server ✓"` (or `"Saved to Offline Queue"`).
  - Navigation actions: **"Log Next Shop"** or **"Back to Dashboard"**.

---

### Screen S-09: Field Visits Ledger & History
- **File**: `src/features/visits/screens/VisitsLedgerScreen.jsx`
- **Navigation Route**: `MainTabs -> Visits`
- **Purpose**: Personal chronological log of all field visits submitted by the logged-in sales rep.
- **UI Components**:
  - Date preset filter bar: **Today**, **Yesterday**, **This Week**, **This Month**.
  - Summary KPI pill: *"12 Visits · 6 Book Conversions"*.
  - Visit cards with expandable remarks and book tags.
- **API Endpoint**: `GET /api/v1/sales-tracking/visits?salesBoyId=...`

---

### Screen S-10: Sales Rep Profile & Offline Sync Center
- **File**: `src/features/profile/screens/ProfileScreen.jsx`
- **Navigation Route**: `MainTabs -> Profile`
- **Purpose**: Sales rep identity, assigned territory zones, network diagnostics, and offline queue flush.
- **UI Components**:
  1. **Profile Card**:
     - Sales Rep Name, Registered Mobile Number, Employee ID.
     - Assigned Territory Zones badges (`South Delhi`, `Noida Sector 1-62`).
  2. **Offline Data & Sync Manager**:
     - Cached retail shops count (`142 shops cached locally`).
     - Pending offline visits queue indicator.
     - **"Sync Now"** manual button with spinning progress.
  3. **App Diagnostics**:
     - App version, backend latency, cached storage size.
  4. **Security & Logout**:
     - **"Sign Out"** with confirmation dialog.

---

## 4. KeyboardProvider, Safe Area & Edge-to-Edge Architecture (CKR House Standard)

In strict accordance with the **`ckr-frontend-native`** skill and `screen-keyboard-safearea.md`, input visibility and keyboard handling are handled centrally. **Screens never touch insets or keyboard math directly.**

### 4.1 Root Provider Setup (`src/app/Providers.jsx`)
The app root must be wrapped in `react-native-keyboard-controller`'s `<KeyboardProvider statusBarTranslucent>`:

```jsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../store';

export default function Providers({ children }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider statusBarTranslucent>
          <ReduxProvider store={store}>
            {children /* NavigationContainer */}
          </ReduxProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```
* `initialWindowMetrics` prevents first-frame layout jump.
* `statusBarTranslucent` on `<KeyboardProvider>` is mandatory so Android translucent status bars don't cause coordinate calculation offsets.

### 4.2 The Three-Zone Form Anatomy (`<Screen variant="form">`)
Every screen with text inputs (e.g. `LoginScreen S-02`, `RecordVisitScreen S-06`) uses `<Screen variant="form" header={...} footer={<AppButton .../>}>`:

1. **Fixed Header Zone**: Brand header or `AppBar` that never scrolls off-screen.
2. **Scrollable Middle Zone (`KeyboardAwareScrollView`)**:
   - Uses `KeyboardAwareScrollView` from `react-native-keyboard-controller` (never a plain `ScrollView`).
   - `mode={Platform.OS === 'android' ? 'layout' : 'insets'}` (ensures Android edge-to-edge resize works identically to iOS).
   - `bottomOffset = footerHeight + keyboardCtaGap + 12` so the active input clears both the keyboard and the sticky CTA.
   - `keyboardDismissMode="on-drag"` to dismiss keyboard naturally on scroll.
   - `keyboardShouldPersistTaps="handled"` so tapping the CTA works immediately on first tap without needing an extra tap to dismiss.
3. **Fixed Footer Zone (`KeyboardStickyView`)**:
   - The primary CTA button sits in a `<KeyboardStickyView>` that smoothly rides up above the software keyboard when opened.
   - Padded with `insets.bottom` when keyboard is closed; drops the inset gap when riding above the keyboard.

### 4.3 Form Field Chaining & Banned Anti-Patterns
- **Field Navigation**: `returnKeyType="next"` with `onSubmitEditing={() => nextInputRef.current?.focus()}`. The final input has `returnKeyType="done"`.
- **Strictly Banned**:
  - `KeyboardAvoidingView` (fails CKR review — inputs still end up covered on Android).
  - Core `SafeAreaView`.
  - `react-native-keyboard-aware-scroll-view` (unmaintained, breaks New Architecture).
  - `KeyboardToolbar` accessory bar (banned — covers screen real estate and hides fields).
  - Manual `Keyboard.addListener` math or `Dimensions` calculations.

---

## 5. Offline-First Resilience & Sync Engine

Field representatives operate inside market basements with poor cellular signal. The app implements a zero-data-loss architecture:

1. **Submission Interceptor**:
   - If device is online: POST directly to `/sales-tracking/app/visits`.
   - If device is offline: serialize payload, attach a client-generated `client_uuid`, and append to `@stenna_offline_queue` in `AsyncStorage`.
2. **Reconnection Listener**:
   - Uses `@react-native-community/netinfo`.
   - On connectivity restore (`isConnected === true`), sequentially flush all queued payloads via background batch dispatch.
3. **Idempotency**:
   - The backend validates `client_uuid` to ensure duplicate visits are never recorded if connection dropped mid-flight.

---

## 5. Folder & Codebase Structure (`app_salesboy/`)

```
app_salesboy/
├── .env                              # API_BASE_URL=http://<ip>:5010/api/v1
├── package.json                      # Plain JS dependencies
├── index.js                          # AppRegistry entry point
└── src/
    ├── api/
    │   ├── client.js                 # Axios / fetch instance with JWT interceptors
    │   └── salesTrackingApi.js       # RTK Query endpoints
    ├── theme/
    │   ├── colors.js                 # Primary #3b82f6, Success #10b981, Dark #0f172a
    │   ├── typography.js             # Font sizes, line heights, weights
    │   ├── spacing.js                # 4, 8, 12, 16, 24, 32 scales
    │   └── index.js                  # Theme export
    ├── components/
    │   ├── AppHeader.jsx             # Top bar with back button & title
    │   ├── AppButton.jsx             # Primary, secondary, and loading button
    │   ├── StatusChip.jsx            # Available / Closed badge
    │   ├── ShopCard.jsx              # Reusable directory card
    │   └── OfflineBanner.jsx         # Non-intrusive offline status banner
    ├── features/
    │   ├── auth/
    │   │   ├── authSlice.js          # Redux token & user state
    │   │   └── screens/
    │   │       ├── SplashScreen.jsx  # S-01
    │   │       └── LoginScreen.jsx   # S-02
    │   ├── dashboard/
    │   │   └── screens/
    │   │       └── DashboardScreen.jsx # S-03
    │   ├── shops/
    │   │   └── screens/
    │   │       ├── ShopsDirectoryScreen.jsx # S-04
    │   │       └── ShopDetailScreen.jsx     # S-05
    │   ├── visits/
    │   │   ├── visitSlice.js         # Offline queue reducer
    │   │   ├── components/
    │   │   │   └── BookPickerModal.jsx      # S-07
    │   │   └── screens/
    │   │       ├── RecordVisitScreen.jsx    # S-06
    │   │       ├── VisitSuccessScreen.jsx   # S-08
    │   │       └── VisitsLedgerScreen.jsx   # S-09
    │   └── profile/
    │       └── screens/
    │           └── ProfileScreen.jsx        # S-10
    ├── navigation/
    │   ├── RootNavigator.jsx         # Auth vs MainTabs routing
    │   └── MainBottomTabs.jsx        # Bottom tab bar with Tabler icons
    └── utils/
        ├── storage.js                # AsyncStorage helpers
        ├── syncEngine.js             # Offline queue manager
        └── formatters.js             # Indian phone, currency, date formatting
```

---

## 6. Implementation Sprints (CKR Delivery Model)

- **Sprint 1 — Core Scaffolding**: React Native Bare CLI setup, Redux store, navigation container, theme tokens.
- **Sprint 2 — Auth & Live Dashboard (S-01 to S-03)**: Phone login with JWT, live KPI dashboard.
- **Sprint 3 — Shops Directory & 360° Intel (S-04 to S-05)**: Searchable shop directory, past pitch history timeline.
- **Sprint 4 — Field Visit & Book Pitch Flow (S-06 to S-08)**: 30-sec visit logging form, catalog book picker modal, success receipt.
- **Sprint 5 — Offline Sync Engine & Visits Ledger (S-09 to S-10)**: Background offline queue flusher, personal visits ledger, profile screen.
