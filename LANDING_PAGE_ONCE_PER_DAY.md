# Landing Page - Once Per Day Feature

## Overview

The landing page now only appears once per day. After the first visit of the day, subsequent page refreshes or visits will skip the landing page and go directly to the dashboard.

## How It Works

### 1. Landing Page Manager (`src/utils/landing-page-manager.ts`)

Utility functions to track landing page visits:

-   **`shouldShowLandingPage()`**: Checks if the landing page should be shown

    -   Returns `true` if this is the first visit of the day
    -   Returns `false` if already visited today
    -   Compares dates (day, month, year) to determine if it's a new day

-   **`markLandingPageVisited()`**: Records the current visit timestamp in localStorage

    -   Stores the visit time as ISO string
    -   Called when the landing page is shown

-   **`resetLandingPageVisit()`**: Clears the visit record (for testing)

### 2. Landing Page Wrapper (`src/pages/LandingPageWrapper.tsx`)

Wrapper component that handles the logic:

```tsx
- Checks if landing page should be shown on mount
- If already visited today → Redirects to /dashboard
- If first visit of the day → Shows landing page and marks visit
```

### 3. App Router Update (`src/app/App.tsx`)

Updated the root route to use the wrapper:

```tsx
// Before
<Route path='/' element={<LandingPage />} />

// After
<Route path='/' element={<LandingPageWrapper />} />
```

## User Experience

### First Visit of the Day

1. User opens the site
2. Landing page is displayed
3. Visit is recorded in localStorage
4. User can navigate to dashboard

### Subsequent Visits (Same Day)

1. User opens the site or refreshes
2. System checks last visit date
3. Detects visit was today
4. Automatically redirects to /dashboard
5. No landing page shown

### Next Day

1. User opens the site
2. System detects it's a new day
3. Landing page is shown again
4. New visit is recorded

## Storage

Uses `localStorage` with key: `lastLandingPageVisit`

**Stored Value**: ISO timestamp string (e.g., `"2026-03-06T14:30:00.000Z"`)

## Testing

To test the feature:

1. **First Visit**: Open the site → Landing page should show
2. **Refresh**: Refresh the page → Should go directly to dashboard
3. **Reset**: Open browser console and run:
    ```javascript
    localStorage.removeItem('lastLandingPageVisit');
    ```
4. **Refresh Again**: Landing page should show again

## Benefits

-   **Better UX**: Users don't see the landing page on every refresh
-   **Faster Access**: Direct access to dashboard after first visit
-   **Daily Reminder**: Landing page still shows once per day for announcements/updates
-   **Lightweight**: Uses localStorage, no server calls needed

## Files Modified

1. **Created**: `src/utils/landing-page-manager.ts` - Landing page visit tracking
2. **Created**: `src/pages/LandingPageWrapper.tsx` - Wrapper with redirect logic
3. **Modified**: `src/app/App.tsx` - Updated route to use wrapper

## Configuration

To change the behavior:

-   **Show every visit**: Remove the wrapper and use `<LandingPage />` directly
-   **Show once per week**: Modify the date comparison in `shouldShowLandingPage()`
-   **Show once ever**: Remove the date comparison, just check if `lastVisit` exists
