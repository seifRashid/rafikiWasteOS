# Rafiki WasteOS — Enterprise Design System & UI/UX Specification

> **Version:** 1.0.0  
> **Target Platform:** Modern Web Application / Enterprise ERP  
> **Domain:** Municipal & Commercial Waste Management, Fleet Logistics, Material Recovery & Sustainability  
> **Visual Reference Baseline:** Logistics & Fleet Telematics Executive Dashboard (Warm-Light Card System)

---

## 1. Design Philosophy

Rafiki WasteOS is an enterprise-grade operational operating system and ERP designed for modern waste management companies, municipal authorities, recycling facilities, and private haulers. The design philosophy balances **high-density data presentation** with **effortless visual clarity, spatial warmth, and tactile hierarchy**.

### Core Tenets

1. **Operational Calm in High-Density Contexts**  
   Waste logistics involves continuous telemetry, weighbridge slips, route deviations, bin sensors, and billing cycles. The interface mitigates cognitive fatigue by employing clean white elevated surfaces, breathable off-white backdrops, generous corner radii, and restrained color accents.
2. **Action-Driven Telematics**  
   Every metric, progress bar, and status indicator serves an operational decision: whether to re-route a compactor truck, inspect an overfilled commercial dumpster, dispatch a field crew, or reconcile an invoice.
3. **Tactile Physicality & Micro-Containers**  
   Inspired by the primary reference design, information is organized into modular, rounded cards with crisp soft shadows, nested statistic pills, and self-contained micro-widgets. Content never bleeds into an amorphous grid; it sits comfortably within delineated containers.
4. **Environmental Dignity (No Clichés)**  
   The visual personality avoids cheesy green gradient leaves and literal recycling arrows across every corner. Instead, it expresses environmental stewardship through precision, clean lines, high-contrast typography, and an authoritative palette grounded in Forest Green (`#00993F`), Solar Amber (`#FECA36`), and Hydro Cyan (`#08A6BA`).

---

## 2. Brand Identity

The brand identity translates the corporate triad of sustainability (Green), efficiency/alertness (Yellow), and technology/clean water (Cyan) into an enterprise UI design language.

### Brand Color Distribution Rule: 70 / 15 / 15

| Brand Pillar | Color Name | Hex Code | Weight | Functional ERP Role |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Brand** | **Forest Green** | `#00993F` | **~70%** | Primary brand presence, active sidebar navigation pills, main CTA buttons, successful status badges, confirmed pickups, high-performance KPI highlight cards, primary progress fills. |
| **Secondary Accent** | **Solar Amber / Gold** | `#FECA36` | **~15%** | Attention states, warning badges, delayed routes, bin fill thresholds (75–89%), pending work orders, highlight accents, secondary metric indicators. |
| **Secondary Accent** | **Hydro Cyan** | `#08A6BA` | **~15%** | Telematics, live GPS tracking, fleet connectivity, in-transit status badges, sensor telemetry, container inventory, secondary chart series, informational badges. |

```
┌────────────────────────────────────────────────────────────────────────┐
│ Brand Color Distribution                                               │
├──────────────────────────────────────────┬──────────────┬──────────────┤
│ Forest Green (#00993F)                   │ Solar Amber  │ Hydro Cyan   │
│ ~70% (Core UI, Actions, Navigation, Won) │ (#FECA36)    │ (#08A6BA)    │
│                                          │ ~15% (Alert) │ ~15% (IoT)   │
└──────────────────────────────────────────┴──────────────┴──────────────┘
```

---

## 3. Color System

To support enterprise tables, form states, dark-contrast requirements, and WCAG AA accessibility, the core colors are expanded into comprehensive tonal scales.

### 3.1 Primary Green (`#00993F`)

| Token | Hex | Usage Context |
| :--- | :--- | :--- |
| `primary-50` | `#EDF9F1` | Subtle row hover, badge backgrounds, light active state fills |
| `primary-100` | `#D6F2E0` | Soft highlight pills, selected item borders |
| `primary-200` | `#ADE4C1` | Accent borders, light progress track fills |
| `primary-300` | `#77D19B` | Chart gradient stops, secondary progress bars |
| `primary-400` | `#3EBA75` | Hover state for secondary green controls |
| `primary-500` | **`#00993F`** | **Base Primary Brand:** Buttons, active sidebar pill, completed tags |
| `primary-600` | `#008235` | Hover state for primary buttons, active interactive controls |
| `primary-700` | `#00682B` | Pressed buttons, dark outline borders |
| `primary-800` | `#005222` | High-contrast text on light green backgrounds |
| `primary-900` | `#003D1A` | Dark hero card background variant, deep headings |

### 3.2 Secondary Amber / Yellow (`#FECA36`)

> **Accessibility Note:** Pure `#FECA36` on white does not meet the 4.5:1 contrast ratio for body text. Use `#FECA36` for filled badges (with dark text `#78350F`), progress fills, chart bars, and icons. For standalone text or links, use `warning-700` (`#B45309`) or `warning-800` (`#92400E`).

| Token | Hex | Usage Context |
| :--- | :--- | :--- |
| `amber-50` | `#FFFDF0` | Warning toast background, warning row highlight |
| `amber-100` | `#FFF8D6` | Warning pill badge background |
| `amber-200` | `#FEF0A8` | Warning borders, route detour alerts |
| `amber-300` | `#FEDE70` | Secondary bar chart series |
| `amber-400` | `#FECA36` | **Base Secondary Accent:** Warning badges, bin 80% full indicator |
| `amber-500` | `#E5B01E` | Amber button hover, interactive star ratings |
| `amber-600` | `#C6930D` | Dark amber icons on light backgrounds |
| `amber-700` | `#9F7306` | Accessible warning text on white backgrounds |
| `amber-800` | `#785608` | High-contrast warning headers |
| `amber-900` | `#4D3603` | Deep amber container text |

### 3.3 Secondary Hydro Cyan (`#08A6BA`)

| Token | Hex | Usage Context |
| :--- | :--- | :--- |
| `cyan-50` | `#EEFBFD` | Telematics card background, informational banners |
| `cyan-100` | `#D6F5FA` | "In Transit" badge background, live sensor tags |
| `cyan-200` | `#B0EBF4` | Active route waypoint stroke, sensor borders |
| `cyan-300` | `#7BDBEB` | Secondary line chart series, live vehicle pin glow |
| `cyan-400` | `#3EC7DC` | Interactive toggle active states |
| `cyan-500` | **`#08A6BA`** | **Base Secondary Accent:** Fleet tracking indicators, IoT badges |
| `cyan-600` | `#068A9B` | Cyan button hover, active table links |
| `cyan-700` | `#056E7C` | Accessible cyan text on white |
| `cyan-800` | `#04545F` | Deep informational headlines |
| `cyan-900` | `#02373E` | Telematics dark card headers |

### 3.4 Neutral & Surface Palette

The reference interface uses a crisp, warm off-white canvas with pure white elevated surfaces:

| Token | Hex | Role |
| :--- | :--- | :--- |
| `surface-canvas` | `#F6F8F7` | Application background (subtle warm-green tint) |
| `surface-card` | `#FFFFFF` | Primary card background, modal bodies, topbar |
| `surface-subtle` | `#F0F4F2` | Nested metric pill backgrounds, input fills, table headers |
| `surface-hover` | `#E8EFEA` | Interactive row hover, button ghost hover |
| `border-subtle` | `#E3E9E5` | Card dividers, input borders, table borders |
| `border-medium` | `#CDD8D1` | Active inputs, nested card boundaries |
| `text-primary` | `#111827` | Headings, primary metrics, table values |
| `text-secondary`| `#4B5563` | Subtitles, field labels, metadata, chart axis labels |
| `text-muted` | `#9CA3AF` | Placeholder text, timestamps, disabled labels |
| `text-inverse` | `#FFFFFF` | Text on Primary Green or dark hero cards |

### 3.5 Semantic Status Palette

* **Success (Collected / Resolved / Paid):**
  * Background: `#EDF9F1`, Border: `#ADE4C1`, Text: `#00682B`, Dot: `#00993F`
* **In Progress / In Transit (En Route / Dispatched):**
  * Background: `#EEFBFD`, Border: `#B0EBF4`, Text: `#056E7C`, Dot: `#08A6BA`
* **Warning / Attention (Overfilled / Delay / Pending Inspection):**
  * Background: `#FFF8D6`, Border: `#FEDE70`, Text: `#785608`, Dot: `#E5B01E`
* **Critical / Danger (Route Blocked / Hazard Spillage / Overdue):**
  * Background: `#FEF2F2`, Border: `#FECACA`, Text: `#991B1B`, Dot: `#EF4444`
* **Neutral / Draft (Scheduled / Inactive / Archived):**
  * Background: `#F3F4F6`, Border: `#E5E7EB`, Text: `#4B5563`, Dot: `#9CA3AF`

---

## 4. Typography

The typography is clean, modern, and optimized for high numerical scannability. It reflects the bold, structured sans-serif type displayed in the reference image.

### Recommended Font Stacks
* **Primary Display & Interface:** `Plus Jakarta Sans` or `Inter`, followed by `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
* **Monospace / Numerical Readouts (Weighbridge, RFID, GPS):** `JetBrains Mono` or `"SF Mono", Menlo, Consolas, monospace`.

### Typographic Hierarchy

| Level | Size | Weight | Line Height | Letter Spacing | Context / Sample Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title** | 24px (1.5rem) | 700 (Bold) | 32px | -0.02em | Main view header (`Suivi logistique`, `Fleet Overview`) |
| **Section Heading** | 18px (1.125rem) | 600 (SemiBold)| 24px | -0.01em | Card titles (`Détail de l'expédition`, `Truck Capacity`) |
| **Card Subtitle** | 12px (0.75rem) | 500 (Medium) | 16px | 0.02em | Uppercase/Muted breadcrumb (`Tableau de bord`, `LIVE DISPATCH`) |
| **KPI Primary Value** | 32px (2.0rem) | 800 (ExtraBold)| 38px | -0.03em | Primary statistic numbers (`72%`, `94%`, `5 860 €`) |
| **KPI Secondary Value**| 20px (1.25rem) | 700 (Bold) | 26px | -0.02em | Sub-metric readouts (`540 km`, `1h 20 min`, `14.2 t`) |
| **Body Regular** | 14px (0.875rem)| 400 (Regular) | 20px | 0.00em | Standard table cell, form text, descriptions |
| **Body Medium** | 14px (0.875rem)| 500 (Medium) | 20px | 0.00em | Driver names, customer titles, primary table items |
| **Label / Caption** | 12px (0.75rem) | 500 (Medium) | 16px | 0.01em | Field labels, metric subtitles (`Distance parcourue`) |
| **Micro Badge** | 11px (0.6875rem)| 600 (SemiBold)| 14px | 0.03em | Status pill text (`En cours`, `Réglé`, `Livrés`) |
| **Navigation Link** | 14px (0.875rem)| 500 (Medium) | 20px | -0.01em | Sidebar navigation labels (`Vue d'ensemble`, `Expéditions`) |

---

## 5. Spacing, Layout & Grid

### 5.1 Base Spacing Scale (8pt System with 4pt Half-Steps)

```
4px   (0.25rem)  - micro-spacing, badge padding, dot margins
8px   (0.5rem)   - compact gaps, icon margins, pill horizontal padding
12px  (0.75rem)  - input field inner vertical padding, nested pill margins
16px  (1.0rem)   - standard internal card padding, grid gutters
20px  (1.25rem)  - comfortable card padding (standard dashboard cards)
24px  (1.5rem)   - large card padding, section separators
32px  (2.0rem)   - page gutter margins, dashboard row gap
40px  (2.5rem)   - major viewport vertical rhythm
```

### 5.2 Elevation, Corner Radii & Borders

Matching the rounded, soft aesthetic of the reference:

* **Border Radii:**
  * Application Canvas Shell: `0px` (or `24px` if framed inside tablet preview)
  * Major Dashboard Cards: `20px` (`1.25rem`)
  * Nested Sub-cards / Pill Metrics: `14px` (`0.875rem`)
  * Buttons & Form Inputs: `10px`–`12px` (`0.625rem`–`0.75rem`)
  * Status Badges / Pills: `9999px` (fully rounded capsule)
  * Dropdowns & Modals: `16px` (`1.0rem`)
* **Borders:**
  * Default card border: `1px solid #E6ECE8` (ensures high definition on low-contrast screens)
  * Active/focused border: `2px solid #00993F`
* **Box Shadows:**
  * `shadow-card`: `0 2px 12px -2px rgba(16, 38, 24, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)`
  * `shadow-card-hover`: `0 8px 24px -4px rgba(16, 38, 24, 0.08), 0 2px 6px 0 rgba(0, 0, 0, 0.03)`
  * `shadow-pill`: `0 1px 3px 0 rgba(0, 153, 63, 0.12)`
  * `shadow-active-nav`: `0 4px 12px 0 rgba(0, 153, 63, 0.28)` (vibrant brand glow on active sidebar pill)
  * `shadow-modal`: `0 20px 40px -8px rgba(15, 23, 42, 0.16)`

---

## 6. Grid & Responsive System

The dashboard layout utilizes a fluid 12-column CSS Grid with a fixed or collapsible sidebar.

```
┌─────────┬─────────────────────────────────────────────────────────────┐
│ Sidebar │ Header (Title + Filters + Search + Notifications + Profile) │
│ (260px) ├─────────────────────────────────────────────────────────────┤
│         │ Live Route Tracking Hero Card (12 Cols)                     │
│         ├──────────────────────────────┬──────────────────────────────┤
│         │ Driver & Trip Details (7 C)  │ Vehicle Capacity (5 C)       │
│         ├──────────────────────────────┼──────────────────────────────┤
│         │ 7-Day Trend Chart (7 C)      │ Solid Green Hero KPI (5 C)   │
│         ├────────────────┬─────────────┴──┬───────────────────────────┤
│         │ Stream Donut   │ Fuel/Energy    │ Live Message Feed (4 C)   │
│         │ (4 Cols)       │ Bar (4 Cols)   │                           │
│         ├────────────────┴────────────────┴───────────────────────────┤
│         │ Operational Optimization Banner (12 Cols)                   │
└─────────┴─────────────────────────────────────────────────────────────┘
```

### Breakpoint Specifications

| Breakpoint | Width | Layout Transformations |
| :--- | :--- | :--- |
| **Desktop XL** | `≥ 1440px` | 12-column grid, 260px expanded sidebar, full map route card, 3-column split for bottom metrics. |
| **Desktop Standard**| `1024px – 1439px`| 12-column grid, 240px sidebar, 2-column or stacked bottom widgets. |
| **Tablet** | `768px – 1023px` | Collapsed icon-only sidebar (72px), cards collapse to single-column or 2-column stacked. |
| **Mobile** | `< 768px` | Off-canvas drawer sidebar, full-width single-column cards, sticky bottom action bar. |

---

## 7. Navigation

The navigation architecture closely replicates the reference design's clean, vertically stacked sidebar.

```
+------------------------------------+
| [Avatar]                           |
| Bonjour,                           |
| Camille                            |
|                                    |
| [ * ] Vue d'ensemble       (Active)|
| [   ] Collectes & Tournées         |
| [   ] Bennes & Conteneurs          |
| [   ] Flotte & Chauffeurs          |
| [   ] Clients & Contrats           |
| [   ] Pesée & Déchetteries   (2)   |
| [   ] Rapports & RSE         (1)   |
| [   ] Paramètres                   |
|                                    |
| ---------------------------------- |
| [ Solid Green Quick Card ]         |
| "Tournées du jour"                 |
|  32 actives - 870 km - 2h45        |
|  [ + Nouvelle tournée ]           |
|                                    |
| [ Stylized Truck / Fleet Graphic ] |
+------------------------------------+
```

### 7.1 Sidebar Specifications

1. **Header Profile Greeting:**
   * User Avatar: `44px` circle with subtle border.
   * Greeting: `12px` muted text ("Bonjour,"), followed by user's first name in `16px` SemiBold (`#111827`).
2. **Navigation Items:**
   * Container: `44px` height, `12px` border-radius or fully rounded pill.
   * Icon: `20px` stroke/fill icon with `12px` right gap.
   * Label: `14px` Medium typography.
   * **Active Item:** Solid Forest Green (`#00993F`) background, pure white text and icon, elevated with soft green shadow `0 4px 12px rgba(0,153,63,0.25)`.
   * **Inactive Item:** Neutral text (`#4B5563`), transparent background. Hover state renders background `#F0F6F2` and text `#00993F`.
   * **Badge Counter:** Pill badge (`20px` height) in soft rose/red `#FEE2E2` with text `#DC2626` (or amber for alerts).
3. **Sidebar Promo / Action Card ("Dernières courses" Equivalent):**
   * Placed towards the bottom of the sidebar.
   * Background: Soft tinted container or solid Forest Green card with white/light text.
   * Displays quick operational overview: *Today: 32 runs, Total Distance: 870 km, Avg Cycle: 2h 45m*.
   * Action Button: White pill button with green text (`+ Nouvelle course` / `+ New Dispatch`).
4. **Bottom Visual Graphic:**
   * High-quality isometric 3D render of a waste management vehicle, compactor, or sorting depot to reinforce domain identity without cluttering operational space.

### 7.2 Header / Top-Bar

1. **Breadcrumb / Context Subtitle:** `12px` uppercase medium gray (`Tableau de bord`).
2. **Page Title:** `24px` bold heading (`Suivi logistique` / `Fleet Telematics`).
3. **Filter Dropdown:** Rounded pill-like selector (`Sélectionner un camion` / `Filter by Vehicle`) with chevron down.
4. **Global Search Input:** Rounded input container (`220px`–`300px` width) with magnifying glass icon and placeholder `"Rechercher..."`.
5. **Notification Bell:** Rounded button with micro notification pill badge in red (`#EF4444`) with count `"3"`.

---

## 8. Dashboard Composition

The primary dashboard transforms the reference design's logistics layout into an operational Waste Management command center.

### 8.1 Module 1: Live Route Tracking & Collection Progress (Top Hero Card)

Directly mirroring the top wide card in the reference screenshot:

* **Header Controls:**
  * Filter toggle pills: `En collecte` (Active - Forest Green pill), `En attente` (Outline pill), `Terminée` (Muted pill).
* **Primary Progress Readout:**
  * Title: `Progression globale`
  * Value: `72%` in `32px` ExtraBold typography.
  * Linear progress bar: `8px` height, track in `#E6ECE8`, active fill in `#00993F`.
* **Nested Sub-Statistic Pills:**
  * Pill 1: Distance Covered (`Distance parcourue: 540 km`) with speedometer icon.
  * Pill 2: Time Remaining (`Temps restant: 1h 20 min`) with clock icon.
* **Map & Waypoint Trace:**
  * Subtle monochrome or soft-gray vector street map background.
  * Curving dotted path (`#00993F` or `#08A6BA` dashed line) connecting circular waypoint nodes representing waste bins, customer pickup points, and transfer stations.
  * Completed waypoints indicated by solid green nodes; pending waypoints by outlined nodes.
* **Floating Alert Card:**
  * Positioned on top-right of the map.
  * Icon: Clock / Alert icon in Amber.
  * Text: `Ralentissement prévu / Circulation dense dans la zone de collecte Nord`.
  * CTA: Pill button in Forest Green (`Voir les détails`).

### 8.2 Module 2: Driver & Waste Pickup Assignment Detail (Middle Left Card)

* **Driver Profile Header:**
  * Circular avatar (`48px`), Driver Name (`Julien Morel`), ID Badge (`EXP-98564`), Assigned Vehicle (`Camion 12 - Benne 16m³`).
  * Driver Rating: 5 stars in Amber (`#FECA36`).
  * Top-right link: `Plus d'infos` in muted gray with hover underline.
* **Operational Metrics Grid (4-Column Sub-grid):**
  1. *Points to Collect:* Number `48` in red/green bold, label `Bennes restantes`.
  2. *Fill Progress Donut:* Circular SVG progress ring with `68%` in center, label `Chargement en cours`.
  3. *Pickup Date / Slot:* Calendar icon with date `25 mai 2025`.
  4. *Status & Next Stop:* Pill badge `En cours` (Green), subtitle `Prochaine étape: Centre de tri Rive-Sud`.
* **Footer Settlement / Tonnage Bar:**
  * Left: `Total à facturer / pesée: 5 860 €` (or metric tonnage `18.4 tonnes`).
  * Right: Payment/Approval status badge `Réglé` (Soft green pill).

### 8.3 Module 3: Vehicle Load & Compactor Capacity (Middle Right Card)

* **Header:** `Capacité du camion` with `Plus d'infos` action.
* **3D Fleet Asset Render:** Centered high-resolution isometric graphic of a waste compactor truck with highlighted payload bay.
* **Capacity Utilization Bar:**
  * Value: `78%` in `24px` bold.
  * Colored linear progress bar with warning threshold (turns Amber at 80%, Red at 95%).
  * Label: `Capacité utilisée (Compaction active)`.
* **Payload Weight Indicators:**
  * Current Weight: `Charge actuelle: 14,2 t`
  * Maximum Legal Weight: `Charge max: 18,0 t`

### 8.4 Module 4: 7-Day Collection Volume Trends (Third Row Left)

* **Card Title:** `Tendances de collecte` with right-aligned period dropdown (`7 derniers jours`).
* **Chart:** Smooth area line chart with gradient fill (`rgba(0, 153, 63, 0.15)` to transparent).
* **Data Nodes:** Circular data points along the line with hover tooltip showing date and collected tonnage.

### 8.5 Module 5: High-Impact Hero KPI Card (Third Row Right)

Directly mirroring the solid red/coral card in the reference screenshot, reimagined in **Forest Green**:

* **Container:** Solid Forest Green (`#00993F`) background, `20px` border-radius, white text throughout.
* **Period Filter:** Semi-transparent white pill dropdown (`Mois en cours v`).
* **Hero Metric:**
  * Value: `94%` in `38px` bold white typography.
  * Label: `Taux de ponctualité des collectes` (On-Time Collection Rate).
  * Target benchmark: `Objectif: 90%` in soft translucent white.
* **Inverted Sparkline:** Clean white vector polyline showing daily performance with circular nodes.
* **Action Button:** Pure white pill button with dark green text (`Voir le rapport`).

### 8.6 Module 6: Waste Stream Breakdown Donut (Bottom Left)

* **Card Title:** `Répartition des déchets`.
* **Donut Chart:** Multi-segment ring using the brand palette:
  * Recyclables (Paper/Cardboard): Forest Green (`#00993F` - 60%)
  * Organic / Compost: Hydro Cyan (`#08A6BA` - 25%)
  * Residual / Landfill: Solar Amber (`#FECA36` - 10%)
  * Hazardous / Electronic: Crimson (`#EF4444` - 5%)
* **Legend:** Vertical legend with colored dots, stream labels, and bold percentages.

### 8.7 Module 7: Fuel & Emissions Bar Chart (Bottom Middle)

* **Card Title:** `Consommation de carburant` with dropdown selector.
* **KPI Header:** `128 L` with green badge `-8% vs période précédente`.
* **Bar Chart:** Vertical rounded bars (top corners `4px` radius) representing daily consumption in liters or carbon emissions.

### 8.8 Module 8: Field Communications & Driver Messages (Bottom Right)

* **Card Title:** `Messages chauffeurs` with `Voir tout` link.
* **Message Rows:**
  * Avatar of driver or dispatcher.
  * Name in SemiBold (`Équipe logistique`, `Sophie Martin`).
  * Message snippet (`Cuve benne #4582 pleine. Déchargement requis`).
  * Timestamp (`10:30`, `Hier`).
  * Unread indicator dot in brand green.

### 8.9 Module 9: Operational Optimization Banner (Bottom Full-Width Card)

Directly mirroring the bottom rounded red banner in the reference screenshot:

* **Container:** Solid Forest Green (`#00993F`) or subtle dark slate card with full rounded corners (`16px`).
* **Icon / Mascot:** Mini depot or truck illustration in a white circular badge.
* **Text Block:**
  * Headline: `Gardez le contrôle de vos tournées en temps réel`.
  * Subtitle: `Suivez, analysez et optimisez chaque collecte grâce à notre algorithme de routage IA.`
* **CTA Button:** White pill button with dark text and right arrow: `Optimiser mes tournées →`.

---

## 9. Cards

Cards are the fundamental building blocks of the interface.

```
┌─────────────────────────────────────────────────────────────┐
│ Card Header                                  Action / Link  │
│ Title (18px SemiBold)                          [ Plus d'infos ]
├─────────────────────────────────────────────────────────────┤
│ Card Body                                                   │
│                                                             │
│   ┌──────────────────────┐   ┌──────────────────────────┐   │
│   │ Nested Metric Pill   │   │ Nested Metric Pill       │   │
│   │ Label                │   │ Label                    │   │
│   │ Value (Bold)         │   │ Value (Bold)             │   │
│   └──────────────────────┘   └──────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Card Footer (Optional)                         Status Pill  │
│ Total / Summary                                [ En cours ] │
└─────────────────────────────────────────────────────────────┘
```

### Card Variants

1. **Standard Elevated Card (`.card-standard`):**
   * Background: `#FFFFFF`
   * Border: `1px solid #E6ECE8`
   * Border Radius: `20px`
   * Padding: `20px` (or `24px` for large containers)
   * Shadow: `shadow-card`
2. **Nested Sub-Card / Metric Pill (`.card-nested`):**
   * Background: `#F7FAF8`
   * Border: `1px solid #E6ECE8`
   * Border Radius: `14px`
   * Padding: `12px 16px`
3. **Inverted Hero Card (`.card-hero-primary`):**
   * Background: `#00993F`
   * Border: None
   * Border Radius: `20px`
   * Text: Pure white `#FFFFFF`
   * Shadows: `0 8px 24px -4px rgba(0, 153, 63, 0.35)`
4. **Interactive Action Card (`.card-action`):**
   * Includes hover elevation `transform: translateY(-2px)`, shadow transition, and clickable boundary.

---

## 10. Buttons

Buttons follow a clean, tactile design with generous corner rounding or pill shapes.

### 10.1 Button Styles & Sizes

| Variant | Normal State | Hover State | Active / Pressed | Text Color |
| :--- | :--- | :--- | :--- | :--- |
| **Primary (Brand Green)** | Background `#00993F` | Background `#008235` | Background `#00682B` | `#FFFFFF` |
| **Secondary (Outline)** | Border `1.5px solid #00993F`, Bg Transparent | Bg `#EDF9F1` | Bg `#D6F2E0` | `#00993F` |
| **Pill Action (Reference Style)**| Bg `#FFFFFF`, Border `1px solid #E6ECE8` | Bg `#F6F8F7`, Border `#CDD8D1` | Bg `#E8EFEA` | `#111827` |
| **Inverted Pill (On Green Cards)**| Bg `#FFFFFF`, Shadow `0 2px 8px rgba(0,0,0,0.1)`| Bg `#F8FAF9` | Bg `#EDEDED` | `#00993F` |
| **Warning / Amber** | Background `#FECA36` | Background `#E5B01E` | Background `#C6930D` | `#4D3603` |
| **Info / Cyan** | Background `#08A6BA` | Background `#068A9B` | Background `#056E7C` | `#FFFFFF` |
| **Danger / Destructive** | Background `#EF4444` | Background `#DC2626` | Background `#B91C1C` | `#FFFFFF` |
| **Ghost / Flat** | Bg Transparent | Bg `#F0F4F2` | Bg `#E3E9E5` | `#4B5563` |

### 10.2 Button Sizes
* **Large (`h-12` / 48px):** Padding `0 24px`, Radius `12px` or `9999px` (Pill), Font 15px SemiBold (Main CTAs, modals).
* **Medium (`h-10` / 40px):** Padding `0 18px`, Radius `10px` or `9999px`, Font 14px SemiBold (Standard forms & tables).
* **Small (`h-8` / 32px):** Padding `0 12px`, Radius `8px` or `9999px`, Font 12px Medium (Card headers, table actions).

---

## 11. Forms & Inputs

ERP forms manage complex inputs such as weighbridge gross/tare weights, waste classification codes (EWC/LoW), customer billing profiles, and GPS geofences.

```
┌─────────────────────────────────────────────────────────────┐
│ Form Field Component Anatomy                                │
│                                                             │
│ Code EWC Déchet *                       [ ? Info Tooltip ]  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Icon] 20 01 01 - Papier et carton              [Clear] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Helper text / Validation feedback                           │
└─────────────────────────────────────────────────────────────┘
```

### Input Rules
1. **Container:** Height `42px`, Border `1px solid #E3E9E5`, Background `#FFFFFF`, Radius `10px`.
2. **Focus State:** Border `2px solid #00993F`, Outline none, Shadow `0 0 0 3px rgba(0, 153, 63, 0.15)`.
3. **Error State:** Border `1.5px solid #EF4444`, Background `#FEF2F2`, Focus shadow `0 0 0 3px rgba(239, 68, 68, 0.15)`.
4. **Dropdown / Select:** Styled select with custom SVG chevron, rounded menu container with `shadow-modal`, search filter inside dropdown.
5. **Segmented Pill Switches:** Like the reference's `[En livraison | En attente | Terminée]`:
   * Container: Background `#F0F4F2`, Padding `4px`, Radius `9999px`.
   * Active Item: Background `#00993F` (or White for secondary controls), Text White, Radius `9999px`, Shadow `0 2px 6px rgba(0,0,0,0.08)`.

---

## 12. Tables & Data Grids

Data-heavy tables manage manifests, weighbridge tickets, bin inventories, and billing transactions.

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ [Search Manifests...]  [Filter: All Streams v]  [Date Range v]     [ Export CSV ] [ + New ]│
├────┬─────────────┬────────────────┬──────────────┬──────────────┬────────────┬───────────┤
│ [ ]│ Ticket ID   │ Date / Heure   │ Client / Site│ Type Déchet  │ Poids Net  │ Statut    │
├────┼─────────────┼────────────────┼──────────────┼──────────────┼────────────┼───────────┤
│ [ ]│ #TK-84920   │ 20/05 09:15    │ SUEZ BTP     │ Carton ondulé│ 4 820 kg   │ [ Validé ]│
│ [x]│ #TK-84921   │ 20/05 09:42    │ VEOLIA Ind.  │ Plastique PET│ 2 140 kg   │ [ En cours]
│ [ ]│ #TK-84922   │ 20/05 10:05    │ Ville Centre │ DIB Mélangé  │ 6 300 kg   │ [ Pesée 2]│
└────┴─────────────┴────────────────┴──────────────┴──────────────┴────────────┴───────────┘
```

### Table Specifications
* **Header:** Background `#F6F8F7`, Text `12px` SemiBold uppercase `#4B5563`, Height `40px`, bottom border `1px solid #E3E9E5`.
* **Rows:** Height `52px` (standard) or `40px` (dense compact mode).
* **Row Hover:** Background `#F2F7F4` (subtle green tint) with smooth 150ms transition.
* **Selected Row:** Background `#E6F5EC`, Left border `3px solid #00993F`.
* **Cell Typography:** `14px` Regular `#111827`, Numerics right-aligned and formatted with proper units (`kg`, `t`, `€`).
* **Pagination:** Bottom sticky or attached bar with total record count (`Affichage 1 à 10 sur 482 résultats`), page numbers inside rounded pill containers, and items-per-page dropdown.

---

## 13. Status & Feedback

Feedback pills in the reference design are rounded capsules with high contrast and legible typography.

### 13.1 Status Badges

| State | Badge Visual Styling | Example ERP Status |
| :--- | :--- | :--- |
| **Completed / Paid** | Bg `#EDF9F1`, Text `#00682B`, Border `#ADE4C1` | `Réglé`, `Collecté`, `Vidée`, `Validé` |
| **In Transit / Active** | Bg `#EEFBFD`, Text `#056E7C`, Border `#B0EBF4` | `En cours`, `En transit`, `Pesée 1 terminée` |
| **Warning / Pending** | Bg `#FFF8D6`, Text `#785608`, Border `#FEDE70` | `En attente`, `Capacité 85%`, `Retard prévu` |
| **Critical / Incident**| Bg `#FEF2F2`, Text `#991B1B`, Border `#FECACA` | `Anomalie`, `Cuve pleine`, `Contrat expiré` |
| **Draft / Inactive** | Bg `#F3F4F6`, Text `#4B5563`, Border `#E5E7EB` | `Brouillon`, `Archivé`, `Planifié` |

### 13.2 Toast Notifications
* Rounded floating containers (`12px` radius) positioned at top-right.
* Accent line on the left indicating semantic status (`#00993F`, `#FECA36`, `#08A6BA`, or `#EF4444`).
* Progress countdown bar along the bottom edge for auto-dismissible toasts (5000ms).

---

## 14. Charts & Data Visualization

Data visualization is central to waste ERP operations (daily tonnage, landfill diversion percentage, fleet fuel efficiency, bin fill telemetry).

### 14.1 Color Palette for Charts

```
Series 1 (Primary - Landfill Diversion / Collected):  #00993F (Forest Green)
Series 2 (Secondary - Recycled / In-Transit):         #08A6BA (Hydro Cyan)
Series 3 (Tertiary - Compost / Pending):              #FECA36 (Solar Amber)
Series 4 (Quaternary - Hazardous / Alert):            #EF4444 (Crimson)
Series 5 (Neutral - Residual):                        #9CA3AF (Slate Gray)
```

### 14.2 Chart Design Rules

1. **Area / Line Charts (Trends & Performance):**
   * Stroke width: `2.5px` with round line joins.
   * Gradient area fill: `40%` opacity at stroke level fading to `0%` at zero-baseline.
   * Data points: White circular nodes (`6px` diameter) with `2px` colored border; expands to `8px` on hover.
   * Grid lines: Subtle dashed lines in `#E5EAE7`, zero-axis solid `#CDD8D1`.
2. **Bar Charts (Fuel Consumption & Daily Tonnage):**
   * Bar radius: Top corners rounded (`4px`–`6px`), bottom corners sharp.
   * Hover state: Darkens by 10% with floating metric tooltip.
3. **Donut / Progress Rings (Material Recovery & Capacity):**
   * Donut ring thickness: `16px`–`20px`.
   * Center readout: Primary percentage in `24px` ExtraBold with secondary label below in `11px` uppercase.
   * Legend: Clean vertical list with color swatches, percentage, and absolute weight (`tonnes`).

---

## 15. Maps & Geographic Interfaces

The reference design features an embedded route map as the hero component. In Rafiki WasteOS, this powers:
* Live GPS truck fleet tracking
* Dynamic route optimization & waypoint sequencing
* Smart bin fill-level heatmaps
* Landfill & transfer station geofences

### Map Visual Rules
* **Tile Style:** Clean, high-contrast light cartography (e.g., Carto Positron or custom Mapbox Light style with softened road networks in `#E5EAE7` and water bodies in `#EEFBFD`).
* **Route Path:** `#00993F` solid stroke (`4px`) with soft directional arrows indicating sequence. Completed segments turn `#9CA3AF` dotted line.
* **Stop Markers / Waypoint Pins:**
  * Standard Stop: `24px` circle with white border and sequence number (`1`, `2`, `3`).
  * Overfilled / Emergency Stop: `32px` pulsing Amber pin with exclamation mark.
  * Landfill / Facility: Square pin with building icon.
  * Active Vehicle: Highlighting truck icon rotated to current vehicle heading with live glowing pulse (`rgba(0, 153, 63, 0.3)`).

---

## 16. Modals & Overlays

* **Backdrop:** Translucent dark neutral `rgba(15, 23, 42, 0.4)` with `backdrop-filter: blur(4px)`.
* **Modal Body:** Pure white `#FFFFFF`, `20px` radius, padding `24px`, maximum width `640px` (standard) or `1024px` (wide operational modal).
* **Slide-over Drawers:** Slides in from the right edge for deep inspections (e.g., viewing full sensor telemetry for a smart container or complete driver trip logs). Width `480px` or `640px`, backdrop blur.
* **Confirmation Dialogs:** Specific affirmative button labels (`"Confirmer la pesée"`, `"Supprimer la tournée"`) instead of generic `"OK"`. Destructive confirmations require explicit red buttons.

---

## 17. Empty & Loading States

### 17.1 Skeleton Loaders
* Emulates exact card layout geometry.
* Shimmer gradient: Linear gradient from `#E8EFEA` to `#F6F8F7` to `#E8EFEA` with `1.5s` infinite ease.
* Corner radii match target elements (`20px` for cards, `9999px` for pills).

### 17.2 Empty States
* Clean isometric or dual-tone illustration of an empty container or depot.
* Clear headline: `"Aucune collecte programmée pour ce secteur"`.
* Explanatory text: `"Toutes les bennes ont été vidées ou aucune tournée n'est planifiée pour cette date."`
* Primary CTA: `[ + Planifier une tournée ]`.

---

## 18. Responsive Behavior

| Component | Desktop (≥ 1024px) | Tablet (768px – 1023px) | Mobile (< 768px) |
| :--- | :--- | :--- | :--- |
| **Sidebar** | Fixed 260px expanded | Collapsed 72px (icons only) | Hidden off-canvas drawer with hamburger button |
| **Header** | Title + Search + Selectors + Bell | Compact Search + Bell | Title + Hamburger + Bell |
| **Hero Route Map**| Side-by-side metrics & interactive map | Stacked metrics above map | Sticky progress summary + collapsible map drawer |
| **Dashboard Grid**| 12-column multi-row arrangement | 2-column or single-column cards | Single-column scrollable feed |
| **Tables** | Full multi-column data table with filters | Horizontally scrolling table | Responsive card list with essential tags |
| **Action Banner** | Horizontal layout with inline CTA button | Stacked text and button | Sticky bottom CTA pill |

---

## 19. Accessibility (WCAG 2.1 AA Compliance)

1. **Contrast Ratios:**
   * Body text (`#111827`) against card background (`#FFFFFF`): **15.2:1** (Passes AAA).
   * Primary Green (`#00993F`) against white (`#FFFFFF`): **4.54:1** (Passes AA for standard text, AAA for large/bold text).
   * Solar Amber text: Do not use `#FECA36` directly on white for text. Use `#785608` (**7.1:1**) or place `#FECA36` inside filled pill badges with dark brown text `#4D3603` (**10.5:1**).
2. **Focus Visibility:**
   * All interactive elements (buttons, links, inputs, tabs) display a distinct focus ring: `outline: 2px solid #00993F; outline-offset: 2px;`.
3. **Color-Blindness Independence:**
   * Status indicators must never rely on color alone. Always pair color dots with text labels (`Validé`, `En attente`, `Anomalie`) or unambiguous icons (Check, Warning Triangle, Clock).
4. **Keyboard Traversal:**
   * Logical tab indexing across cards, forms, tables, and modal dialogs with focus trap enabled in overlays.

---

## 20. Motion & Interaction

Animations must feel snappy, physical, and restrained, prioritizing operational speed over decorative delays.

* **Durations:**
  * Micro-interactions (Button hover, pill switch): `150ms ease-out`
  * Card expansions & dropdowns: `200ms cubic-bezier(0.16, 1, 0.3, 1)`
  * Modal & Drawer transitions: `250ms cubic-bezier(0.16, 1, 0.3, 1)`
  * Chart render animations: `600ms ease-out`
* **Card Hover:** `transform: translateY(-2px); box-shadow: var(--shadow-card-hover);` with `transition: all 0.2s ease;`.
* **Reduced Motion:** When `@media (prefers-reduced-motion: reduce)` is detected, all transitions are instant (`duration: 0.01ms`).

---

## 21. Design Tokens

Developers and AI coding agents should use these tokens in CSS, Tailwind configurations, and style libraries.

### 21.1 CSS Custom Properties (`tokens.css`)

```css
:root {
  /* Brand Core */
  --brand-primary: #00993F;
  --brand-primary-hover: #008235;
  --brand-primary-active: #00682B;
  --brand-primary-subtle: #EDF9F1;
  --brand-primary-border: #ADE4C1;

  --brand-yellow: #FECA36;
  --brand-yellow-hover: #E5B01E;
  --brand-yellow-subtle: #FFF8D6;
  --brand-yellow-text: #785608;

  --brand-cyan: #08A6BA;
  --brand-cyan-hover: #068A9B;
  --brand-cyan-subtle: #EEFBFD;
  --brand-cyan-text: #056E7C;

  /* Neutrals & Canvas */
  --color-canvas: #F6F8F7;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F0F4F2;
  --color-surface-hover: #E8EFEA;
  --color-border-subtle: #E3E9E5;
  --color-border-medium: #CDD8D1;

  /* Typography */
  --color-text-primary: #111827;
  --color-text-secondary: #4B5563;
  --color-text-muted: #9CA3AF;
  --color-text-inverse: #FFFFFF;

  /* Semantic Feedback */
  --color-success: #00993F;
  --color-warning: #E5B01E;
  --color-danger: #EF4444;
  --color-info: #08A6BA;

  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 9999px;

  /* Elevation Shadows */
  --shadow-card: 0 2px 12px -2px rgba(16, 38, 24, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02);
  --shadow-card-hover: 0 8px 24px -4px rgba(16, 38, 24, 0.08), 0 2px 6px 0 rgba(0, 0, 0, 0.03);
  --shadow-nav-active: 0 4px 12px 0 rgba(0, 153, 63, 0.28);
  --shadow-modal: 0 20px 40px -8px rgba(15, 23, 42, 0.16);

  /* Layout */
  --sidebar-width-expanded: 260px;
  --sidebar-width-collapsed: 72px;
  --header-height: 72px;
}
```

### 21.2 Tailwind CSS Configuration Extension

```typescript
// tailwind.config.ts / theme extension
export const wasteTheme = {
  colors: {
    brand: {
      green: {
        50: '#EDF9F1',
        100: '#D6F2E0',
        200: '#ADE4C1',
        300: '#77D19B',
        400: '#3EBA75',
        500: '#00993F', // Primary 70%
        600: '#008235',
        700: '#00682B',
        800: '#005222',
        900: '#003D1A',
      },
      yellow: {
        50: '#FFFDF0',
        100: '#FFF8D6',
        200: '#FEF0A8',
        300: '#FEDE70',
        400: '#FECA36', // Secondary 15%
        500: '#E5B01E',
        600: '#C6930D',
        700: '#9F7306',
        800: '#785608',
      },
      cyan: {
        50: '#EEFBFD',
        100: '#D6F5FA',
        200: '#B0EBF4',
        300: '#7BDBEB',
        400: '#3EC7DC',
        500: '#08A6BA', // Secondary 15%
        600: '#068A9B',
        700: '#056E7C',
        800: '#04545F',
      },
    },
    canvas: '#F6F8F7',
    surface: {
      DEFAULT: '#FFFFFF',
      subtle: '#F0F4F2',
      hover: '#E8EFEA',
    },
  },
  borderRadius: {
    card: '20px',
    nested: '14px',
    input: '10px',
    pill: '9999px',
  },
  boxShadow: {
    card: '0 2px 12px -2px rgba(16, 38, 24, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
    'card-hover': '0 8px 24px -4px rgba(16, 38, 24, 0.08), 0 2px 6px 0 rgba(0, 0, 0, 0.03)',
    'nav-active': '0 4px 12px 0 rgba(0, 153, 63, 0.28)',
  },
};
```

---

## 22. Component Guidelines

When constructing interfaces, agents and developers must adhere to the following component specifications:

### 22.1 Statistic / KPI Card Anatomy
```html
<div class="bg-white rounded-card p-5 border border-slate-100 shadow-card flex flex-col justify-between">
  <!-- Top bar -->
  <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
    <span>DISTANCE PARCOURUE</span>
    <icon class="text-brand-green-500" />
  </div>
  <!-- Metric value -->
  <div class="my-3 flex items-baseline gap-2">
    <span class="text-3xl font-extrabold text-slate-900 tracking-tight">540</span>
    <span class="text-sm font-semibold text-slate-500">km</span>
  </div>
  <!-- Sub-indicator -->
  <div class="text-xs text-brand-green-700 bg-brand-green-50 px-2 py-0.5 rounded-pill inline-flex items-center w-fit gap-1">
    <span>↑ 12% vs hier</span>
  </div>
</div>
```

### 22.2 Inverted Hero Card Anatomy
```html
<div class="bg-brand-green-500 text-white rounded-card p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
  <div class="flex justify-between items-center z-10">
    <span class="text-sm font-medium text-white/80">Performance de collecte</span>
    <button class="bg-white/20 text-white text-xs px-3 py-1 rounded-pill backdrop-blur-sm">Mois en cours ▾</button>
  </div>
  <div class="my-4 z-10">
    <div class="text-4xl font-black tracking-tight">94%</div>
    <div class="text-xs text-white/80 mt-1">Collectes dans les délais (Obj: 90%)</div>
  </div>
  <!-- Sparkline curve -->
  <div class="w-full h-16 my-2 z-10">
    <!-- SVG sparkline with white stroke -->
  </div>
  <div class="mt-2 z-10">
    <button class="bg-white text-brand-green-600 font-semibold text-xs px-4 py-2 rounded-pill hover:bg-slate-50 transition-colors shadow-sm">
      Voir le rapport
    </button>
  </div>
</div>
```

---

## 23. Do's and Don'ts

### Do
* **DO** use the `20px` corner radius consistently across primary cards to retain the reference's friendly, high-end look.
* **DO** nest metrics in micro-pills with `#F0F4F2` backgrounds for data hierarchy.
* **DO** keep the primary green (`#00993F`) as the focal anchor (~70%) while utilizing yellow (`#FECA36`) and cyan (`#08A6BA`) strictly for telemetry, warnings, and charts (~15% each).
* **DO** format numbers with explicit units (`kg`, `tonnes`, `km`, `min`, `€`) and bold typography.
* **DO** provide clear pill badges with semantic dots for statuses.

### Don't
* **DON'T** apply bright green gradients or eco-leaf clipart everywhere. The UI should look like a cutting-edge tech platform, not an organic juice box.
* **DON'T** use pure `#FECA36` text on white backgrounds; always use darker amber (`#785608`) or place it within filled container badges.
* **DON'T** create sharp `0px` or `4px` bordered boxy cards; cards must stay soft, elevated, and rounded.
* **DON'T** use harsh black shadows (`rgba(0,0,0,0.3)`); use soft diffuse green/slate-tinted shadows.
* **DON'T** overcrowd tables without pagination, search, and sorting controls.

---

## 24. Implementation Guidelines for Developers & AI Agents

1. **Strict Token Usage:** Never hardcode hex values like `#1a73e8` or `#e0e0e0`. Always reference design tokens (`var(--brand-primary)`, `var(--color-surface)`, etc.).
2. **Card Nesting Pattern:** When designing new pages (e.g., Weighbridge Ticket Screen or Bin Sensor Map), start with the outer grid layout, add `rounded-card` containers with `shadow-card`, and use nested pill containers for sub-metrics.
3. **Icons:** Use featherweight or outline iconography (e.g., `Lucide Icons` or `Tabler Icons`) with `20px` bounding boxes and `2px` stroke weight.
4. **Data Density Toggle:** Provide a compact view mode for enterprise dispatch operators who need to see 50+ table rows simultaneously without breaking layout aesthetics.
5. **Single Source of Truth:** Any future UI mockups, React components, or dashboard pages generated in this repository must reference this `DESIGN.md` specification to maintain complete brand and aesthetic coherence.
