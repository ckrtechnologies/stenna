# Stenna Sales Boy Mobile App — Luxury UI Overhaul & 3-Tier Architecture Plan

**Document ID**: `DOC-SALES-PLAN-02`  
**Client**: Stenna Wallpaper Enterprise  
**Author**: CKR Technologies (Greater Noida, India)  
**Date**: 19 October 2026  
**Status**: Architecture & Implementation Plan  

---

## 1. Executive Summary & Core Directives

Based on direct client instructions, this plan defines the complete upgrade path for **`app_salesboy`** across two core pillars:

1. **Luxury Visual Identity & UI/UX Harmonization**:
   - **Brand Primary Color**: **Luxury Deep Forest Dark Green** (`#0B3D2E` / `#0D4A38`) replacing dark blue/black obsidian surfaces.
   - **Consistent Button Colors**: All primary call-to-actions, call buttons, and submit buttons unified to **one consistent dark green tone** (`#0B3D2E`) with crisp white (`#FFFFFF`) typography. Zero blue buttons, zero multi-color clashes.
   - **Official Stenna Logo**: Integrate authentic Stenna brand asset (`admin/public/logo.png`) across Splash, Login, Drawer, and Headers; eliminate all dummy/placeholder logos and blue AI templates.
   - **Header Simplification**: Remove the "Online" pill badge from headers completely for a cleaner, executive look.
   - **Drawer Motion**: Replace spring oscillation with a direct, smooth slide-in from the left (`Easing.out(Easing.cubic)`).

2. **3-Tier Field Hierarchy (Zone > Market > Shop) & Visit Workflow**:
   - Transition from 2 tiers (Zone > Shop) to **3 tiers: Zone → Market → Shop**.
   - Enable sales reps to filter their beat by assigned **Zone** and specific **Market** before drilling into individual retail stores.
   - Streamlined field check-in flow:
     - Mark store **Available / Open** vs **Unavailable / Closed** with visit notes.
     - If Available: Present catalog books, record **Books Shown (Pitched)** and **Requirement / Orders Captured** (fulfilled offline by client; app captures demand).
     - Dedicated field observations and dealer feedback notes.

---

## 2. Visual Identity & Design System Upgrade

### 2.1 Theme Tokens Specification (`src/theme/colors.js`)

| Token | Hex Value | Purpose |
|---|---|---|
| `primary` | `#0B3D2E` | **Luxury Forest Dark Green** — used for all main CTAs, headers, and active states |
| `primaryDark` | `#07261C` | Deepest green for background surfaces, splash screen, and drawer base |
| `primaryLight` | `#14533C` | Hover / pressed state for dark green buttons |
| `primarySurface` | `rgba(11, 61, 46, 0.08)` | Subtle tinted background for inputs, active rows, and chips |
| `surfaceDark` | `#0E3326` | Dark green card background for high-contrast executive cards |
| `gold` | `#D4AF37` | Luxury gold accents (monogram outlines, active badges, rating stars) |
| `textWhite` | `#FFFFFF` | Crisp white font on dark green cards, buttons, and headers |
| `textMain` | `#0F172A` | Primary text on white/light backgrounds |
| `textMuted` | `#64748B` | Secondary meta text on light backgrounds |
| `textDim` | `#94A3B8` | Subtle text on dark cards |
| `borderLight` | `#E2E8F0` | Clean light card divider border |
| `borderDark` | `rgba(255, 255, 255, 0.12)` | Subtle border on dark green containers |

### 2.2 Button Color Harmonization Rule
* **Old Behavior**: Inconsistent button colors (blue `#1D4ED8` for login/check-in, emerald `#059669` for calls, red for actions).
* **New Unified Standard**:
  * **All Action Buttons**: Solid **Dark Green** (`#0B3D2E` / `#0D4A38`) with crisp white `#FFFFFF` text and vector icons.
  * Call Store button: Solid `#0B3D2E` with white text and `IconPhoneCall`.
  * Check-In button: Solid `#0B3D2E` with white text and `IconArrowRight`.
  * Submit Visit button: Solid `#0B3D2E` with white text.
  * Confirm Books button: Solid `#0B3D2E` with white text.
  * Danger actions (Sign Out): Kept as outlined / subtle crimson `#DC2626` only for destructive intent.

### 2.3 Official Stenna Brand Asset Integration
* Source file: `admin/public/logo.png` (885 × 179 px transparent PNG).
* Bundled to: `app_salesboy/src/assets/logo.png`.
* Standard component `<StennaLogo variant="light|dark" size="sm|md|lg" />` rendering the high-res PNG with proper aspect ratio containment.

### 2.4 Header Simplification (`AppBar.jsx`)
* Remove the `onlineBadge` ("Online" text and pulsing dot) from the right column of all app bars.
* Replaced by optional screen actions (filter, search icon) or clean empty spacing for a focused layout.

### 2.5 Crisp Drawer Animation (`AppDrawer.jsx`)
* Remove `withSpring(0, { damping: 24, stiffness: 220 })`.
* Use linear/cubic smooth slide:
  ```javascript
  translateX.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
  ```
* Slide-out closes with:
  ```javascript
  translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200, easing: Easing.in(Easing.cubic) });
  ```
* Zero bounce or back-and-forth wobble.

---

## 3. 3-Tier Territory Architecture (Zone > Market > Shop)

### 3.1 Hierarchy Structure

```
Level 1: ZONE (e.g., Delhi NCR, Mumbai Metro, UP West)
   └── Level 2: MARKET (e.g., Kotla Furniture Market, MG Road Design Hub, Sector 18 Market)
          └── Level 3: SHOP / VENDOR (e.g., Classic Home Interiors, Royal Wall Decor)
```

### 3.2 Database Schema Enhancements (PostgreSQL)

```sql
-- 1. New Table: sales_markets (Level 2)
CREATE TABLE IF NOT EXISTS public.sales_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.sales_zones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_markets_zone ON public.sales_markets(zone_id);

-- 2. Link Shops / Vendors to Market (Level 3)
ALTER TABLE public.sales_vendors 
ADD COLUMN IF NOT EXISTS market_id UUID REFERENCES public.sales_markets(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sales_vendors_market ON public.sales_vendors(market_id);

-- 3. Sales Boy Assigned Markets Junction (Optional Granular Assignment)
CREATE TABLE IF NOT EXISTS public.sales_boy_markets (
  sales_boy_id UUID NOT NULL REFERENCES public.sales_boys(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.sales_markets(id) ON DELETE CASCADE,
  PRIMARY KEY (sales_boy_id, market_id)
);
```

### 3.3 Backend API Endpoints (Express 5)

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/sales/markets` | Authenticated | List markets filtered by `zoneId` or sales rep's assigned zones |
| `POST` | `/api/v1/sales/admin/markets` | Admin | Create new market under a zone |
| `PUT` | `/api/v1/sales/admin/markets/:id` | Admin | Update market details |
| `DELETE` | `/api/v1/sales/admin/markets/:id` | Admin | Soft-delete / deactivate market |
| `GET` | `/api/v1/sales/vendors` | Authenticated | Extended with `?marketId=...` filter query |

---

## 4. End-to-End Field Sales Workflow

```
[Sales Rep Login]
       ↓
[Dashboard: Today's Assigned Zone & Markets Overview]
       ↓
[Select Zone] → [Select Market / Market Chip Filter]
       ↓
[Browse Assigned Shops in Market]
       ↓
[Arrive at Store & Check-In]
       ↓
[Mark Availability: Store Open vs Closed]
       ├── If CLOSED → Enter Reason / Notes → Submit Visit
       ↓
[If OPEN: Present Wallpaper Catalog Books]
       ├── 1. Mark Books Shown (Pitched / Sampled)
       ├── 2. Mark Books Ordered (Requirement Captured for Offline Fulfillment)
       ↓
[Enter Detailed Field Observations & Remarks]
       (e.g., "Dealer requested ST-02 vinyl samples, competitor pricing aggressive, follow-up next Monday")
       ↓
[Submit Visit → Live Sync to Server + Database]
```

### 4.1 Detailed Step Specifications

1. **Beat Assignment**:
   - The admin assigns 1 or more Zones and Markets to the sales boy.
   - When the sales boy logs in, the app displays their active Zone and Market tabs.
2. **Market Drilldown & Filtering**:
   - Inside the **Retail Stores** screen (`S04`), horizontal pill chips allow switching between markets (e.g., `All Markets`, `Kotla Market (12)`, `MG Road Hub (8)`).
3. **Availability Toggling**:
   - Fast 1-tap toggle: **Store Open & Available** (Dark Green) vs **Store Closed / Away** (Crimson).
   - If the store is closed, catalog section folds away, allowing instant submission with a closed note.
4. **Offline Requirement / Order Capture**:
   - Rep opens the **Book Picker**:
     - Tap `+ Pitch` on books displayed to the dealer.
     - Tap `+ Order` on books the dealer commits to order.
   - Clear UI disclaimer: *"Requirement captured for offline sales order processing."*
5. **Proper Field Observations**:
   - Multiline expandable notes input (min 3 rows) with placeholder prompts:
     *"Record dealer feedback, competitor catalogs seen, display space, reorder timeline..."*

---

## 5. Screen-by-Screen Implementation Checklist

### S-01: Splash Screen (`S01Splash.jsx`)
- [ ] Background updated to luxury deep forest dark green (`#07261C` / `#0B3D2E`).
- [ ] Replace text title with high-res official Stenna brand logo asset (`src/assets/logo.png`).
- [ ] Gold subtle loader and CKR Technologies build watermark.

### S-02: Phone Login (`S02LoginPhone.jsx`)
- [ ] Replace placeholder header with official Stenna logo image.
- [ ] Unified primary dark green action button (`#0B3D2E`) for "Sign In with Phone".
- [ ] Input borders and focus state in dark green.
- [ ] Remove blue AI styling; clean dark green security badge.

### S-03: Field Dashboard (`S03FieldDashboard.jsx`)
- [ ] Header bar in solid dark green (`#0B3D2E`).
- [ ] Remove "Online" pill badge.
- [ ] KPI Card styled in luxury dark green (`#0E3326`) with gold metric numbers.
- [ ] Add **Zone & Market Context Banner** showing the rep's assigned territory breakdown.
- [ ] Solid dark green CTA: `+ Log New Field Visit`.
- [ ] Store summary showing breakdown by Market.

### S-04: Retail Stores Directory (`S04ShopsDirectory.jsx`)
- [ ] Header in solid dark green (`#0B3D2E`) with hamburger icon; "Online" badge removed.
- [ ] **Market Filter Horizontal Scroll Bar**:
  - `All Markets` | `Market A` | `Market B` | `Market C`
- [ ] Shop Cards:
  - Market tag badge prominently displayed beside Shop Name.
  - Call Button: Unified solid dark green (`#0B3D2E`) with white text.
  - Check-In Button: Unified solid dark green (`#0B3D2E`) with white text.

### S-05: Shop Detail (`S05ShopDetail.jsx`)
- [ ] Executive card in luxury dark green with Zone and Market breadcrumb (`Delhi NCR > Kotla Market`).
- [ ] Unified dark green Call button (`#0B3D2E`).
- [ ] Check-In CTA button in dark green.

### S-06: Record Field Visit (`S06RecordVisit.jsx`)
- [ ] Target store summary showing Zone, Market, and address.
- [ ] Availability Status:
  - `Store Open` (solid dark green `#0B3D2E`).
  - `Closed / Away` (outline crimson).
- [ ] Catalog Selection Launcher with clear distinction:
  - *Pitched/Shown count* vs *Requirement/Order count*.
- [ ] Field Observations text area: 4 lines, auto-expanding, dark green focus border.
- [ ] Submit button: Solid dark green (`#0B3D2E`).

### S-07: Book Picker Modal (`BookPickerModal.jsx`)
- [ ] Dual action pill per catalog book:
  - `Pitch` (marked green when shown).
  - `Order Req` (marked gold/green when dealer orders).
- [ ] Confirm button: Solid dark green (`#0B3D2E`).

### S-08: Visit Success Screen (`S08VisitSuccess.jsx`)
- [ ] Glowing dark green circular badge with checkmark.
- [ ] Receipt card detailing: Store, Market, Status, Catalogs Pitched, Requirements Captured, Notes.
- [ ] Dual action buttons in solid dark green.

### S-09: Field Visits Ledger (`S09VisitsLedger.jsx`)
- [ ] Header in solid dark green without "Online" badge.
- [ ] Ledger cards showing Market name along with Store name, timestamp, and notes.

### S-10: Rep Profile & Offline Sync (`S10ProfileSync.jsx`)
- [ ] Header in solid dark green without "Online" badge.
- [ ] Rep Card with official Stenna logo and rep details.
- [ ] Sync button in solid dark green (`#0B3D2E`).
- [ ] Sign Out button in outlined crimson.

### Left Navigation Drawer (`AppDrawer.jsx`)
- [ ] Slide animation changed to non-bouncing direct slide (`Easing.out(Easing.cubic)`).
- [ ] Brand header using official Stenna logo PNG.
- [ ] Background in deep dark green (`#07261C` / `#0B3D2E`).
- [ ] Quick CTA button in solid dark green.

---

## 6. Implementation Phasing & Next Action

1. **Phase 1: Design System & Visual Assets (Immediate)**:
   - Copy `admin/public/logo.png` to `app_salesboy/src/assets/logo.png`.
   - Update `src/theme/colors.js` with dark green primary tokens.
   - Update `AppBar.jsx` to remove "Online" badge.
   - Update `AppDrawer.jsx` to use smooth cubic slide-in without bouncing.
   - Unify all buttons to solid dark green across S-01 to S-10.

2. **Phase 2: Database & Backend Tier 2 (Market Entity)**:
   - Run SQL migration for `public.sales_markets` and alter `sales_vendors.market_id`.
   - Implement `sales-tracking` routes/controllers for Market listing and filtering.

3. **Phase 3: Mobile 3-Tier Market Flow & Requirement Capture**:
   - Add Market filter bar to `S04ShopsDirectory`.
   - Connect visits flow with Market context and requirement notes.
   - Validate live on emulator and backend.
