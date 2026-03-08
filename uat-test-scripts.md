# FictionForge — UAT Test Scripts
### Pre-Launch User Acceptance Testing

> **How to use this document:** Work through each persona's journey top-to-bottom. Check ✅ or ❌ each step. Note any bugs with screenshots. Each journey is designed to be completed in 15-30 minutes.

---

## Test Environment Setup

- **URL:** https://www.fictionry.com
- **Browsers to test:** Chrome (desktop + mobile), Safari (iOS), Firefox
- **Devices:** Desktop (1440px+), tablet (768px), mobile (375px)
- **Test accounts:** Create fresh accounts for each persona OR use incognito
- **Stripe test cards:** `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline)

---

## Persona 1: 🆕 New Reader — "Alex"
*First-time visitor who found the site via Google. Wants to browse, find something to read, and decide whether to sign up.*

### Journey 1A: Anonymous Browsing (No Account)

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Navigate to homepage | Homepage loads with genre shelves, featured stories, trending sections. No errors. | | |
| 2 | Scroll full homepage | All sections render: hero/banner, genre shelves, trending, rising stars, new releases. Cover images load. | | |
| 3 | Click a genre shelf (e.g., "Fantasy") | Navigates to `/browse/genre/fantasy` with filtered stories | | |
| 4 | Click "Browse" in nav | `/browse` page loads with filter sidebar (genres, tags, sort options) | | |
| 5 | Apply genre filter | Story list updates to show only selected genre | | |
| 6 | Apply tag filter | Story list updates correctly | | |
| 7 | Change sort order (e.g., Most Popular, Newest) | Results re-sort correctly | | |
| 8 | Click on a story card | Story detail page loads: cover, description, chapters list, ratings, tags, author info | | |
| 9 | Click "Read Chapter 1" | Chapter reader opens with content visible | | |
| 10 | Verify reader controls (anonymous) | Can change font size, theme (light/dark/sepia), font family | | |
| 11 | Navigate to next chapter via Prev/Next buttons | Navigation works, next chapter loads | | |
| 12 | Visit `/guides` | Guides landing page loads with search bar and 4 category cards | | |
| 13 | Browse a guide (e.g., Readers → Getting Started) | Guide page renders with TOC sidebar, breadcrumbs, content | | |
| 14 | Visit `/genres` | Genre browsing page loads with all genres | | |
| 15 | Visit `/popular`, `/new-releases`, `/rising-stars` | Each page loads with appropriate story listings | | |
| 16 | Visit `/about`, `/terms`, `/privacy`, `/dmca` | Static pages load without errors | | |
| 17 | Visit `/premium` | Premium info page loads showing benefits and pricing | | |
| 18 | **Mobile:** Repeat steps 1-11 on phone | All pages responsive, no horizontal scroll, touch targets adequate | | |

### Journey 1B: Sign Up & Onboarding

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Click "Sign Up" | Sign up page loads with email/password form | | |
| 2 | Enter email + password and submit | Account created, redirected to create profile | | |
| 3 | Complete profile creation (username, display name, bio) | Profile saved, redirected to onboarding or homepage | | |
| 4 | Verify email verification flow | Verification email received, link works | | |
| 5 | After signup, visit homepage | Homepage may show personalized content or genre selection | | |

### Journey 1C: Logged-In Reader Experience

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Navigate to a story and click "Follow" | Story added to library, button changes state | | |
| 2 | Visit `/library` | Library page shows followed story | | |
| 3 | Start reading a chapter, read halfway, leave | Reading progress saved (verify with progress indicator) | | |
| 4 | Return to library | "Continue Reading" or progress indicator visible | | |
| 5 | Resume reading | Chapter opens at previous scroll position | | |
| 6 | Leave a rating (star rating) on a story | Rating submitted, average updates | | |
| 7 | Leave a comment on a chapter | Comment appears in comment section | | |
| 8 | Reply to own comment | Reply threaded under parent | | |
| 9 | Like a chapter (heart/thumbs up) | Like registered, count updates | | |
| 10 | Visit `/library/history` | Reading history shows visited chapters | | |
| 11 | Visit `/library/ratings` | Shows stories you've rated | | |
| 12 | Visit `/library/comments` | Shows your comment history | | |
| 13 | Visit `/notifications` | Notifications page loads (may be empty for new user) | | |
| 14 | Visit `/settings/profile` | Can edit display name, bio, avatar | | |
| 15 | Visit `/settings/notifications` | Notification preferences load and are toggleable | | |
| 16 | Visit `/settings/account` | Account settings: email, password change, delete account option | | |
| 17 | Toggle dark mode | Entire site switches theme correctly | | |
| 18 | Visit author profile page `/author/[username]` | Author's public profile with their stories listed | | |

---

## Persona 2: 📖 Dedicated Reader — "Jamie"
*Reader who wants the premium experience: reading customization, continuous scroll, PWA install.*

### Journey 2A: Reading Experience Deep-Dive

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Open a chapter with 2000+ words | Chapter loads fully, no truncation | | |
| 2 | Open reading settings panel | Settings panel slides in with font, size, theme, line height, reading mode options | | |
| 3 | Change font family | Text re-renders in new font immediately | | |
| 4 | Increase font size to maximum | Text scales up, layout doesn't break | | |
| 5 | Decrease font size to minimum | Text still readable, no overlap | | |
| 6 | Switch to Sepia theme | Background changes to warm sepia, text color adjusts | | |
| 7 | Switch to Dark theme | Full dark mode in reader | | |
| 8 | Switch to Light theme | Back to default light | | |
| 9 | Toggle Continuous Scroll mode ON | Page transitions to continuous scroll view | | |
| 10 | Scroll past chapter end | Next chapter loads seamlessly with chapter separator | | |
| 11 | Verify chapter separator shows: completion badge, comment toggle, next chapter preview | All elements present and styled | | |
| 12 | Click "Show Comments" in separator | Comments expand inline between chapters | | |
| 13 | Scroll deep into comments | "Collapse Comments" sticky button appears above bottom nav (not hidden behind it) | | |
| 14 | Click "Collapse Comments" | Comments collapse, scrolls back to separator | | |
| 15 | Continue scrolling through 3+ chapters | Each chapter loads, separators appear, no jank or freezes | | |
| 16 | Switch back to Paged mode | Returns to single-chapter view with Prev/Next navigation | | |
| 17 | Verify Prev/Next buttons on mobile | Buttons visible with labels (not just tiny arrows), thumb-friendly size | | |
| 18 | Verify word count + reading time in chapter header | Both displayed (e.g., "2.4k words · 10 min read") | | |
| 19 | **Mobile:** Test all reading settings | All font/theme/mode changes work on mobile | | |
| 20 | **Mobile:** Test continuous scroll | Smooth scrolling, chapters load, no white gaps | | |

### Journey 2B: PWA Installation

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | **iOS Safari:** Visit site | Site loads normally | | |
| 2 | Tap Share → "Add to Home Screen" | App icon appears on home screen with correct icon | | |
| 3 | Open from home screen | Opens in standalone mode (no Safari chrome/URL bar) | | |
| 4 | Navigate through the app | Navigation works, no broken states | | |
| 5 | **Android Chrome:** Visit site | Install prompt may appear (or use menu → "Install app") | | |
| 6 | Install and open | App opens standalone with correct icon and name | | |
| 7 | Visit `/offline-reader` | Offline reader page loads | | |

### Journey 2C: Premium Subscription

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Visit `/premium` | Premium page shows benefits and pricing ($3/month or $30/year) | | |
| 2 | Click Subscribe (monthly) | Redirected to Stripe Checkout | | |
| 3 | Complete with test card `4242 4242 4242 4242` | Payment succeeds, redirected back to site | | |
| 4 | Verify premium badge appears on profile | Premium indicator visible | | |
| 5 | Visit `/settings/billing` | Shows active subscription details, manage/cancel options | | |
| 6 | Click "Manage Subscription" | Opens Stripe Customer Portal | | |
| 7 | **Test decline:** Try subscribing with `4000 0000 0000 0002` | Error handled gracefully with user-friendly message | | |

---

## Persona 3: ✍️ New Author — "Morgan"
*Writer who wants to publish their first story. Tests the entire author creation flow.*

### Journey 3A: First Story Creation

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Sign up with new account | Account created successfully | | |
| 2 | Navigate to "Start Writing" or author dashboard | `/author/dashboard` loads (may be empty state with helpful CTA) | | |
| 3 | Click "New Story" | `/author/stories/new` form loads | | |
| 4 | Fill in: title, description, genre(s), tags, content warnings | All fields accept input, multi-select works for genres | | |
| 5 | Upload a cover image | Image uploads, preview shows | | |
| 6 | Submit story | Story created, redirected to story management page | | |
| 7 | Click "New Chapter" | Chapter editor loads with TipTap rich text editor | | |
| 8 | Write content with formatting: bold, italic, headings, blockquotes | All formatting tools work in toolbar | | |
| 9 | Add an author note (before/after chapter) | Author note field available and saves | | |
| 10 | Save as Draft | Chapter saved with "Draft" status, not visible to readers | | |
| 11 | Edit the draft | Draft loads back into editor with all formatting preserved | | |
| 12 | Publish the chapter | Status changes to Published, chapter visible on story page | | |
| 13 | Visit story page as reader (incognito) | Story appears with published chapter, draft NOT visible | | |
| 14 | Add a second chapter | Chapter created with correct numbering (Ch 2) | | |
| 15 | Reorder chapters (if supported) | Chapter order updates | | |
| 16 | Edit story details (title, description, genres) | `/author/stories/[id]/edit` loads, changes save | | |
| 17 | View story management page | `/author/stories/[id]` shows all chapters with status indicators | | |

### Journey 3B: Bulk Import

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | From story management, click "Import Chapters" | `/author/stories/[id]/chapters/import` loads with tabbed UI | | |
| 2 | Switch to EPUB tab | EPUB upload interface shown | | |
| 3 | Upload a test EPUB file | File parsed, chapters detected and listed with previews | | |
| 4 | Edit a chapter title in preview | Title updates in preview | | |
| 5 | Deselect a chapter | Chapter unchecked, won't be imported | | |
| 6 | Click Import | Selected chapters created as drafts | | |
| 7 | Verify imported chapters on management page | All imported chapters appear as drafts with correct titles | | |
| 8 | Switch to DOCX tab | DOCX upload interface shown | | |
| 9 | Upload a test DOCX file | File parsed, chapters detected | | |
| 10 | Switch to Paste tab | Multi-chapter paste text area shown | | |
| 11 | Paste multiple chapters with separators | Parser detects chapter breaks, shows preview | | |
| 12 | Check Platform Guides tab | Migration instructions for Royal Road, Wattpad, Scribble Hub, AO3 shown | | |
| 13 | **Edge case:** Upload an invalid file | Graceful error message, no crash | | |
| 14 | **Edge case:** Upload EPUB with no detectable chapters | Helpful message explaining issue | | |

### Journey 3C: Author Dashboard & Analytics

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Visit `/author/dashboard` | Dashboard shows stories list with key stats | | |
| 2 | Visit `/author/stats` | Analytics page loads with views, follows, ratings data | | |
| 3 | Verify stats make sense | Numbers are plausible (not negative, not obviously wrong) | | |
| 4 | Click into a specific story's stats | Story-level analytics visible | | |
| 5 | Visit `/author/dashboard/earnings` | Earnings page loads (may be $0 for new author) | | |

---

## Persona 4: 💰 Monetizing Author — "Taylor"
*Established author who wants to set up tiers and earn money.*

### Journey 4A: Monetization Setup

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Visit `/author/dashboard/monetization` | Monetization page loads with tier configuration | | |
| 2 | View available tiers ($3, $6, $12) | Tiers displayed with descriptions of what each includes | | |
| 3 | Enable a tier (e.g., $3/month) | Tier activated | | |
| 4 | Set up Stripe Connect | "Connect with Stripe" button → redirected to Stripe onboarding | | |
| 5 | Complete Stripe onboarding (test mode) | Returns to site, account status shows as connected | | |
| 6 | Set a chapter to be tier-gated | Chapter's `min_tier_name` updated, gate indicator visible | | |
| 7 | Visit gated chapter as non-subscriber (different account) | Paywall/gate message shown with subscription CTA | | |
| 8 | Subscribe to author's tier (as reader account) | Stripe Checkout → payment succeeds → subscription active | | |
| 9 | Access gated chapter as subscriber | Chapter content visible | | |
| 10 | Visit `/author/dashboard/earnings` as author | Earnings reflect the subscription | | |
| 11 | Visit `/settings/billing` as subscribing reader | Author subscription visible alongside any reader premium sub | | |

### Journey 4B: Payout Flow

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Check earnings balance | Balance displayed correctly | | |
| 2 | Request payout (if balance ≥ $20 minimum) | Payout request submitted | | |
| 3 | Verify payout appears in earnings history | Payout status shown (pending/processing) | | |

---

## Persona 5: 🔍 Discovery-Focused Reader — "Sam"
*Tests the personalization and discovery features.*

### Journey 5A: Browse & Discovery

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Visit `/browse` | Browse page with filters loads | | |
| 2 | Filter by genre | Results filtered correctly | | |
| 3 | Filter by multiple tags | Results show intersection of tags | | |
| 4 | Visit `/genres` | All genres displayed with story counts | | |
| 5 | Click a genre | Navigates to genre-filtered browse page | | |
| 6 | Visit `/tags` | Tag cloud/list displayed | | |
| 7 | Click a tag | Navigates to tag-filtered browse page | | |
| 8 | Visit `/popular` | Popular stories listed with correct ordering | | |
| 9 | Visit `/most-followed` | Most-followed stories listed | | |
| 10 | Visit `/recently-updated` | Recently updated stories listed (check dates make sense) | | |
| 11 | Visit `/new-releases` | New stories listed with recent publication dates | | |
| 12 | Visit `/rising-stars` | Rising stars listed (fastest growing) | | |
| 13 | Visit `/featured` | Editorially featured stories displayed | | |
| 14 | Visit `/community-picks` | Community-selected stories displayed | | |

### Journey 5B: Personalization (Logged In)

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Read 5+ chapters across 2-3 genres | Reading progress tracked | | |
| 2 | Return to homepage | Personalized shelves may appear ("Because you read X") | | |
| 3 | Check "Related Stories" on story page | Recommendations shown based on genre/tags | | |
| 4 | Verify story page has "More from this Author" | Section present if author has other stories | | |
| 5 | Follow several stories in one genre | Library reflects follows | | |
| 6 | Revisit homepage | Genre shelves should weight toward reading behavior | | |

---

## Persona 6: 🛡️ Admin — "Admin User"
*Tests admin panel functionality.*

### Journey 6A: Admin Dashboard

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Log in as admin user | Admin nav option visible | | |
| 2 | Visit `/admin` | Admin dashboard loads with overview stats | | |
| 3 | Visit `/admin/users` | User management table loads with search/filter | | |
| 4 | Search for a user | Results filter correctly | | |
| 5 | View user details | User profile, activity, subscriptions visible | | |
| 6 | Visit `/admin/reports` | Content reports/flags listed | | |
| 7 | Visit `/admin/tickets` | Support tickets listed | | |
| 8 | Click into a ticket | Ticket detail page loads with conversation thread | | |
| 9 | Visit `/admin/featured` | Can manage featured stories | | |
| 10 | Visit `/admin/announcements` | Can create/manage platform announcements | | |
| 11 | Visit `/admin/payments` | Payment overview and transaction history | | |
| 12 | Visit `/admin/dmca` | DMCA claims management | | |

### Journey 6B: Admin Payment Controls

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | View financial report | Report generates with revenue, fees, author splits | | |
| 2 | Run fraud scan | Scan completes, flags (if any) displayed | | |
| 3 | Review a fraud flag | Can approve/dismiss flag | | |
| 4 | Process a payout | Payout moves to processed state | | |
| 5 | Hold a payout | Payout held with reason | | |
| 6 | Issue a refund | Refund processed, reflects in records | | |

---

## Persona 7: 📱 Mobile-Only User — "Jordan"
*Tests everything on a phone. This persona catches responsive design issues.*

### Journey 7A: Mobile Navigation & Layout

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Visit homepage on mobile | No horizontal scrolling, all content accessible | | |
| 2 | Open hamburger/mobile menu | Navigation menu opens smoothly | | |
| 3 | Navigate to all major sections via mobile menu | Each link works, pages load correctly | | |
| 4 | Test bottom navigation bar in reader | Prev/Next visible with text labels, not just icons | | |
| 5 | Test touch targets throughout | All buttons/links have minimum 44px touch targets | | |
| 6 | Test forms on mobile (sign up, create story, comment) | Keyboard opens, fields don't get hidden behind keyboard | | |
| 7 | Test image loading | Cover images load at appropriate mobile sizes | | |
| 8 | Rotate device (portrait → landscape → portrait) | Layout adjusts correctly, no broken states | | |
| 9 | Test pull-to-refresh behavior | No unexpected behavior or double-loading | | |
| 10 | Test long story descriptions | Text truncates or expands gracefully, no overflow | | |

### Journey 7B: Mobile Reader Experience

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Open chapter on mobile | Full-width reading, comfortable margins | | |
| 2 | Open settings panel | Panel doesn't overflow screen, all options accessible | | |
| 3 | Change font size to max | Text reflows without horizontal scroll | | |
| 4 | Test continuous scroll on mobile | Smooth scroll, chapters preload, no jank | | |
| 5 | Test chapter separator on mobile | All elements (badge, comments, preview) fit screen | | |
| 6 | Expand comments in continuous scroll | Comments visible, collapse button above bottom nav | | |
| 7 | Navigate with bottom Prev/Next bar | Bar is sticky, buttons are clear and tappable | | |
| 8 | Test reading with phone in dark mode + reader in dark mode | No weird color conflicts, fully dark | | |

---

## Persona 8: 🚨 Edge Case Explorer — "Casey"
*Deliberately tries to break things.*

### Journey 8A: Input Validation & Error Handling

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Sign up with already-used email | Error message: "Email already in use" | | |
| 2 | Sign up with invalid email format | Validation error before submission | | |
| 3 | Sign up with weak password | Password requirements communicated | | |
| 4 | Create story with empty title | Validation prevents submission | | |
| 5 | Create story with extremely long title (500+ chars) | Handled gracefully (truncated or error) | | |
| 6 | Create story with empty description | Either prevented or story created with blank desc | | |
| 7 | Post empty comment | Prevented by validation | | |
| 8 | Post comment with only whitespace | Prevented or trimmed | | |
| 9 | Post extremely long comment (10,000+ chars) | Handled (truncated, pagination, or character limit) | | |
| 10 | Try to access `/admin` as non-admin | Redirected or 403/unauthorized message | | |
| 11 | Try to edit another author's story | Prevented, appropriate error | | |
| 12 | Try to access `/author/stories/[invalid-uuid]/edit` | 404 or graceful error page | | |
| 13 | Visit `/story/nonexistent-id` | 404 page or "Story not found" | | |
| 14 | Visit `/story/[valid-id]/chapter/nonexistent-chapter` | "Chapter not found" or redirect to story page | | |
| 15 | Double-click submit buttons rapidly | No duplicate submissions (stories, chapters, comments) | | |
| 16 | Use browser back/forward through reader | Navigation state consistent, no white pages | | |
| 17 | Open site in two tabs, log out in one | Second tab handles auth state gracefully on next action | | |

### Journey 8B: Content Edge Cases

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Create chapter with only an image | Renders without crash | | |
| 2 | Create chapter with very long unbroken word | Word wraps or scrolls, doesn't break layout | | |
| 3 | Create chapter with HTML/script tags in title | Sanitized, no XSS | | |
| 4 | Create story with special characters in title (é, ñ, 中文, emoji 🎉) | Characters preserved correctly | | |
| 5 | Upload EPUB with unusual encoding | Handled gracefully | | |
| 6 | Paste content with embedded images (from Word) | Images handled or stripped gracefully | | |
| 7 | Create story with no chapters, view as reader | Appropriate empty state ("No chapters yet") | | |

---

## Persona 9: 🔗 SEO & Link Tester — "Robin"
*Verifies public URLs, meta tags, and sharing.*

### Journey 9A: Public Pages & SEO

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Check homepage `<title>` tag | Meaningful title, not "Next.js App" | | |
| 2 | Check story page meta tags | Title, description, og:image present | | |
| 3 | Check chapter page meta tags | Title includes chapter name and story name | | |
| 4 | Share story URL in messaging app | Link preview shows cover image + description | | |
| 5 | Share chapter URL | Link preview shows chapter title + story info | | |
| 6 | Visit `/guides` pages | All guides are publicly accessible (no login required) | | |
| 7 | Check `/guides` page titles | SEO-friendly titles | | |
| 8 | Test `/browse/genre/[genre]` for all genres | Each genre page loads, has content | | |
| 9 | Check footer links | All footer links work and go to correct pages | | |
| 10 | Check 404 page | Navigating to `/nonexistent-page` shows styled 404 | | |

---

## Persona 10: 🆘 Support Seeker — "Drew"
*Tests the support/help system.*

### Journey 10A: Support Flow

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Visit `/support` | Support center loads with ticket list (or empty state) | | |
| 2 | Click "New Ticket" | `/support/new` form loads | | |
| 3 | Submit a support ticket | Ticket created, confirmation shown | | |
| 4 | View ticket in `/support` list | Ticket appears with status | | |
| 5 | Click into ticket | `/support/tickets/[id]` shows ticket details | | |
| 6 | Visit `/guides` from support page (if linked) | Guides accessible for self-service help | | |

---

## Cross-Cutting Concerns (Test with ANY persona)

### Authentication & Sessions

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Log out | Redirected to homepage or login, protected routes inaccessible | | |
| 2 | Visit protected route while logged out | Redirected to login with return URL | | |
| 3 | Log in with correct credentials | Success, redirected to intended page | | |
| 4 | Log in with wrong password | Error message (not revealing if email exists) | | |
| 5 | Forgot password flow | Email sent, reset link works, password updated | | |
| 6 | Session persistence | Close browser, reopen, still logged in | | |

### Performance & Loading

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Homepage initial load | Under 3 seconds on good connection | | |
| 2 | Story page load | Under 2 seconds | | |
| 3 | Chapter load | Under 2 seconds, content appears quickly | | |
| 4 | Browse page with filters | Filter changes reflect in under 1 second | | |
| 5 | Image lazy loading | Cover images below fold load as you scroll, not all at once | | |
| 6 | No console errors | Open DevTools → Console, navigate through site, no red errors | | |

### Accessibility Basics

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Tab through homepage with keyboard | Focus indicators visible, logical tab order | | |
| 2 | Use Enter/Space to activate buttons | All interactive elements keyboard-accessible | | |
| 3 | Check color contrast in all themes | Text readable against background in light/dark/sepia | | |
| 4 | Zoom browser to 200% | Layout adjusts, no overlapping content | | |
| 5 | Check all images have alt text | Cover images and icons have meaningful alt text | | |

---

## Bug Report Template

When you find an issue, capture:

```
**Bug #:** [number]
**Persona/Journey:** [e.g., Persona 3, Journey 3A, Step 8]
**Device/Browser:** [e.g., iPhone 14 / Safari]
**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected:** [what should happen]
**Actual:** [what actually happened]
**Screenshot:** [attach]
**Severity:** 🔴 Blocker / 🟠 Major / 🟡 Minor / 🟢 Cosmetic
```

---

## Test Summary Checklist

| Persona | Journey | Status | Blocker Count |
|---------|---------|--------|---------------|
| 🆕 New Reader | 1A: Anon Browsing | | |
| 🆕 New Reader | 1B: Sign Up | | |
| 🆕 New Reader | 1C: Logged In | | |
| 📖 Dedicated Reader | 2A: Reading Deep-Dive | | |
| 📖 Dedicated Reader | 2B: PWA | | |
| 📖 Dedicated Reader | 2C: Premium | | |
| ✍️ New Author | 3A: First Story | | |
| ✍️ New Author | 3B: Bulk Import | | |
| ✍️ New Author | 3C: Dashboard | | |
| 💰 Monetizing Author | 4A: Monetization Setup | | |
| 💰 Monetizing Author | 4B: Payouts | | |
| 🔍 Discovery Reader | 5A: Browse | | |
| 🔍 Discovery Reader | 5B: Personalization | | |
| 🛡️ Admin | 6A: Dashboard | | |
| 🛡️ Admin | 6B: Payments | | |
| 📱 Mobile User | 7A: Nav & Layout | | |
| 📱 Mobile User | 7B: Mobile Reader | | |
| 🚨 Edge Cases | 8A: Validation | | |
| 🚨 Edge Cases | 8B: Content | | |
| 🔗 SEO Tester | 9A: Public Pages | | |
| 🆘 Support Seeker | 10A: Support Flow | | |
| — | Auth & Sessions | | |
| — | Performance | | |
| — | Accessibility | | |

**Total Test Steps: ~175**
**Estimated Testing Time: 4-6 hours (full pass)**

> **Tip:** Don't try to do this all in one sitting! Do 2-3 personas per session. Start with Persona 1 (New Reader) and Persona 3 (New Author) — they cover the critical happy paths.

---

## Genre SEO Landing Pages (Feb 2026)

### As Any User (Public Pages)

**Genre Index Page (`/genres`)**
1. Navigate to /genres
2. Verify page title is "Browse Fiction by Genre | Fictionry"
3. Verify genre cards display with emojis, names, and story counts
4. Click a genre card → should navigate to /browse/genre/[genre]
5. View page source → confirm JSON-LD CollectionPage schema present

**Individual Genre Pages (`/browse/genre/[genre]`)**
1. Navigate to /browse/genre/Fantasy
2. Verify page has SEO title like "Best Fantasy Web Fiction & Stories | Fictionry"
3. Verify genre description text appears above the story grid
4. Verify genre icon (emoji) displays next to description
5. Verify breadcrumbs: Home > Genres > Fantasy
6. Verify sort dropdown works (Popular, Newest, Updated)
7. Scroll to bottom → verify "Related Genres" section with 3-4 linked genre cards
8. Click a related genre → navigates to that genre page
9. View page source → confirm:
   - `<meta name="description">` has unique genre-specific description
   - `<link rel="canonical">` points to correct URL
   - JSON-LD `CollectionPage` schema present
   - OpenGraph tags present
10. Test with URL-encoded genres: /browse/genre/Sci-Fi, /browse/genre/Slice%20of%20Life
11. Test invalid genre (e.g., /browse/genre/InvalidGenre) → should show 404

**Sitemap Verification**
1. Visit /sitemap.xml
2. Verify genre URLs are included (all 20 genres + /genres index)
3. Verify URLs use https://www.fictionry.com format

**Edge Cases**
- Genre with no stories → shows empty state with "Be the first to write one!" message
- Direct URL access to genre page → should load correctly (static generation)

---

## SEO-Friendly URLs with Nanoid Short IDs (Feb 2026)

### Story URLs

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Click any story from homepage/browse | URL is `/story/[slug]-[shortId]` format (e.g., `/story/blood-money-wn4rDDX`) | | |
| 2 | Verify story page loads correctly | Title, cover, description, chapters all render | | |
| 3 | Visit old UUID URL: `/story/[uuid]` | 301 redirects to new slug+shortId URL | | |
| 4 | Modify slug in URL (keep shortId): `/story/wrong-slug-wn4rDDX` | 301 redirects to correct slug URL | | |
| 5 | Visit with invalid shortId: `/story/anything-ZZZZZZZ` | 404 page displayed | | |
| 6 | Check story cards on homepage, browse, search | All internal links use new URL format (no UUIDs in URLs) | | |

### Chapter URLs

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Click a chapter from story page | URL is `/story/[storySlug]-[storyShortId]/chapter/[chapterSlug]-[chapterShortId]` | | |
| 2 | Verify chapter content loads | Chapter text renders, reading progress works | | |
| 3 | Use chapter navigation (prev/next arrows) | URL updates to correct slug+shortId for each chapter | | |
| 4 | Use keyboard navigation (← →) | Same — URL updates correctly | | |
| 5 | Use mobile swipe navigation | URL updates correctly | | |
| 6 | Visit old UUID chapter URL: `/story/[uuid]/chapter/[uuid]` | 301 redirects to new format | | |
| 7 | Modify chapter slug (keep shortId) | 301 redirects to correct slug | | |
| 8 | Toggle between continuous scroll and paginated mode | URLs update correctly in both modes, mode switch preserves position | | |
| 9 | In continuous scroll: scroll past chapter boundaries | URL updates to current chapter's slug+shortId | | |
| 10 | Click chapter in story page chapter list | Navigates to correct chapter with slug URL | | |

### Redirect & SEO Verification

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Visit `/sitemap.xml` | All story/chapter URLs use new slug+shortId format | | |
| 2 | Check OG tags on story page (view source or Facebook Debugger) | `og:url` uses new slug URL | | |
| 3 | Check OG tags on chapter page | `og:url` uses new chapter slug URL | | |
| 4 | Share a story link on social media / paste in chat | Preview card shows correct title, description, cover image | | |
| 5 | Test DMCA page links | Any links to stories use new URL format | | |

### Edge Cases

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Story with special characters in title | Slug is URL-safe (hyphens, lowercase, no specials) | | |
| 2 | Chapter with very long title | Slug is truncated to reasonable length | | |
| 3 | Author renames a story | Old slug URL redirects to new slug (shortId unchanged) | | |
| 4 | Author renames a chapter | Old chapter slug URL redirects to new slug | | |
| 5 | Author reorders chapters | All chapter URLs still work (shortId is immutable) | | |
| 6 | Author deletes a chapter then adds new one | Other chapter URLs unaffected (no number shifting) | | |

---

## Image Optimization & Cover Lightbox

### Any User — Image Optimization
| # | Action | Expected Result | Pass? | Notes |
|---|--------|----------------|-------|-------|
| 1 | Open any story card page (homepage, browse, search) | Cover images load — check Network tab, images served as WebP or AVIF (not raw PNG/JPEG) | | |
| 2 | Scroll down on browse page with many story cards | Images below the fold lazy-load (don't all load at once) | | |
| 3 | Open Continue Reading section (homepage, logged in) | Thumbnails render correctly at 80×112px, no layout shift | | |
| 4 | Open profile page → Reading Stats → Recent Reading | Cover thumbnails render at 40×56px, properly cropped | | |
| 5 | Resize browser window from desktop to mobile | Cover images are responsive — no overflow, proper scaling | | |
| 6 | Upload a new cover image for a story | Preview still works (uses local blob, not next/image) | | |

### Any User — Cover Lightbox (Story Detail Page)
| # | Action | Expected Result | Pass? | Notes |
|---|--------|----------------|-------|-------|
| 1 | Navigate to a story with a cover image | Cover shows `cursor-zoom-in` on hover | | |
| 2 | Click the cover image | Dark overlay appears, image enlarges (up to 800×1200px max) | | |
| 3 | Click the X button in top-right | Lightbox closes | | |
| 4 | Open lightbox, click outside the image | Lightbox closes | | |
| 5 | Open lightbox, press Escape key | Lightbox closes | | |
| 6 | Open lightbox on mobile | Image fits within viewport, no horizontal scroll | | |
| 7 | Navigate to a story WITHOUT a cover image | Placeholder gradient shown, no lightbox trigger, no errors | | |
| 8 | Open lightbox, verify no page scroll behind | Background should not scroll while lightbox is open | | |

---

## Security Audit Tests

### Security Headers

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Open DevTools → Network tab, load any page, inspect response headers | `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` all present | | |
| 2 | Check `X-Frame-Options` value | Should be `DENY` — site cannot be embedded in iframes | | |
| 3 | Check `Strict-Transport-Security` value | Should include `max-age=63072000; includeSubDomains; preload` | | |
| 4 | Check `Permissions-Policy` value | Should disable camera, microphone, geolocation | | |

### Admin Route Protection

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Log out, navigate to `/admin` | Redirected to `/login` | | |
| 2 | Log in as a regular user (non-admin), navigate to `/admin` | Redirected to `/` (homepage) | | |
| 3 | Log in as admin, navigate to `/admin` | Admin dashboard loads normally | | |
| 4 | Log in as moderator, navigate to `/admin` | Admin dashboard loads (moderators have access) | | |

### Rate Limiting

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Open DevTools console, rapidly call an API route 60+ times in 1 minute (e.g., `fetch('/api/...')` in a loop) | After limit exceeded, responses return `429 Too Many Requests` | | |
| 2 | Check 429 response headers | Should include `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` | | |
| 3 | Wait for rate limit window to expire (~1 min), retry | Requests succeed again | | |
| 4 | Normal browsing usage (page loads, reading chapters) | No rate limit hits during normal usage — limits are generous | | |

### XSS Sanitization (Chapter Import)

| # | Step | Expected Result | ✅/❌ | Notes |
|---|------|----------------|-------|-------|
| 1 | Go to Author → Import, upload a test file containing `<script>alert('xss')</script>` in chapter HTML | Script tag stripped from preview — no alert fires | | |
| 2 | Upload file with `<img onerror="alert('xss')">` in content | `onerror` attribute removed from preview | | |
| 3 | Upload file with `<iframe src="...">` in content | iframe tag removed entirely | | |
| 4 | Upload normal EPUB with standard HTML (bold, italic, paragraphs) | Content renders correctly — no legitimate HTML stripped | | |

---

## 🔗 Contextual Help Icons

**Persona: Any authenticated user**

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 1 | Navigate to Author Dashboard | Small `?` icon visible next to "Author Dashboard" heading | | |
| 2 | Hover over the `?` icon | Tooltip appears: "Getting started guide" | | |
| 3 | Click the `?` icon | New tab opens to `/guides/authors/getting-started` | | |
| 4 | Navigate to Writing Stats page | `?` icon links to `/guides/authors/analytics` | | |
| 5 | Navigate to Monetization page | `?` icon links to `/guides/authors/monetization` | | |
| 6 | Navigate to Import Chapters page | `?` icon links to `/guides/authors/importing` | | |
| 7 | Navigate to Edit Story page | `?` icon links to `/guides/authors/formatting` | | |
| 8 | Navigate to My Library | `?` icon links to `/guides/readers/getting-started` | | |
| 9 | Navigate to Settings → Billing | `?` icon links to `/guides/readers/premium` | | |
| 10 | Test on mobile viewport | `?` icons are tappable (no hover dependency) — opens guide in new tab | | |

---

## 📥 EPUB Export (Author Only)

**Persona: Author with published story**

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 1 | Go to Author → Stories → select a story with published chapters | "Download EPUB" button visible next to other action buttons | | |
| 2 | Click "Download EPUB" | Button shows loading spinner ("Generating...") | | |
| 3 | Wait for download to complete | `.epub` file downloads with sanitized story title as filename | | |
| 4 | Open EPUB in Apple Books / Calibre | Book opens with correct title, author name, and description | | |
| 5 | Check cover page | Cover image displays (if story has one) | | |
| 6 | Check title page | Shows story title, author name, blurb, "Generated by Fictionry" | | |
| 7 | Navigate to table of contents | All published chapters listed in correct order | | |
| 8 | Read through chapters | HTML content renders correctly (bold, italic, links) | | |
| 9 | Check chapters with author notes | Author notes appear before/after chapter content in styled boxes | | |
| 10 | Test with story that has no published chapters | Error toast: "No published chapters to export" | | |

**Persona: Non-author reader**

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 1 | Try to access `/api/export/epub?storyId=<someone-elses-story>` directly | 403 error: "You can only export your own stories" | | |
| 2 | Try to access without being logged in | 401 error: "Authentication required" | | |

---

## Auto Chapter Gating (Feb 23, 2026)

### Author Persona — Gating Configuration
1. Go to Author Dashboard → click on any story with multiple published chapters
2. **No tiers enabled**: Should see "All chapters are free" with link to monetization page
3. **Enable tiers**: Go to monetization → enable at least 2 tiers → return to story
4. **Gating config section** should appear between Announcements and Blurb
5. Set Supporter to 2 chapters ahead, verify Enthusiast must be ≥ 2
6. Verify preview shows correct breakdown (e.g., "Free: Ch 1-10, Supporter+: Ch 11-12, Enthusiast+: Ch 13-15")
7. Save → verify toast "Chapter gating updated!"
8. Check chapter list — lock icons should appear on gated chapters
9. **Edge case**: Set both to 0 → all chapters should be free (preview disappears)
10. **Edge case**: Story with fewer chapters than advance count → verify no crash

### Author Persona — Chapter Edit Page
1. Open a gated chapter for editing
2. Should see orange info banner: "This chapter requires [Tier] tier or higher"
3. Should link to story overview for gating management
4. Should NOT show a tier dropdown selector
5. Open a free chapter → no tier info banner shown

### Reader Persona — Access Control
1. As a non-subscriber, try to read a gated chapter → should be blocked
2. Subscribe at Supporter tier → gated supporter chapters should be accessible
3. Verify higher-gated chapters (Enthusiast+) still blocked for Supporter
4. Verify author can always read their own gated chapters

### Notifications (requires push notification setup)
1. As an author, publish a new chapter on a story with gating configured
2. Free followers should get notification about the chapter that just became free (NOT the new chapter)
3. Tier subscribers should get notification about the chapter entering their window
4. Highest tier subscribers should get notification about the new chapter itself

---

## Library Card Progress & Settings Fixes (Feb 24, 2026)

### Reading Settings Wrapping (All users)
1. Open any chapter → click Settings
2. On mobile/narrow screen, verify all button groups wrap properly:
   - Reading Mode (Paged/Continuous)
   - Font options (6 buttons)
   - Line Spacing (4 buttons)
   - Theme (5 buttons)
   - Content Width (3 buttons)
3. ✅ No buttons should overflow or be cut off

### Browse Page URLs (benreader)
1. Go to /browse
2. Click any story card
3. ✅ URL should be `/story/short-id-slug-format` NOT `/story/uuid-format`
4. Verify all story links use clean URLs

### Library Container Width
1. Go to /library
2. ✅ Container width should match /browse page (max-w-6xl)
3. Filter tabs should fit within the container

### Library Card Chapter Progress (benreader - needs stories with reading progress)
1. Go to /library → Reading tab
2. For a story with partial progress:
   - ✅ Progress bar shows X / Y chapters
   - ✅ "📖 Continue: Ch. N — Title" link appears (clickable, goes to correct chapter)
   - ✅ "✨ X new chapters since you last read" shows if applicable
   - ✅ "📝 Latest: Ch. N — Title · time ago" shows
   - ✅ Button says "Continue Ch. N" (not generic "Continue")
3. For a fully caught-up story:
   - ✅ Button says "Caught up ✓"
4. For a story with no progress:
   - ✅ Button says "Start Reading"
   - ✅ No "Continue" chapter info shown

### Subscription Tier Cards (benreader - needs active author subscription)
1. Go to a story page where you have an active author subscription
2. ✅ Summary banner shows: "You're subscribed as [Tier Name]" with Manage link
3. ✅ Tier cards still visible below (NOT hidden)
4. ✅ Current tier shows "Current Plan" badge
5. ✅ Lower tiers show "Included in your plan"
6. ✅ Higher tiers show "Subscribe" button

## Reading Progress & Smart Continue (Feb 24, 2025)

### Test as Reader (benreader)

**Scroll-based read marking:**
1. Open a story with multiple chapters
2. Navigate to an unread chapter
3. Scroll to ~50% of the chapter → chapter should NOT be marked as read
4. Check library → chapter should still show as unread in progress count
5. Go back to same chapter → scroll to 90%+ → chapter should now be marked as read
6. Check library → progress count should update

**Scroll position save/restore:**
1. Open a chapter, scroll to ~40%
2. Navigate away (go to library or different page)
3. Return to the same chapter → should see "Resuming where you left off" toast and scroll restored to ~40%
4. Navigate to a DIFFERENT chapter of the same story → should NOT restore previous chapter's scroll position (starts at top)

**Smart Continue Reading (Library):**
1. Read chapter 3 to 50% (don't finish it) → navigate away
2. Go to Library → "Continue" button should say "Continue Ch. 3" (not Ch. 4)
3. Click Continue → should open Ch. 3 and restore scroll to ~50%
4. Now scroll Ch. 3 to 90%+ (marks as read)
5. Go to Library → "Continue" should now say "Continue Ch. 4" (next unread)

**Chapter Complete Card:**
1. Read a chapter all the way to the bottom where the "End of Chapter X" card appears
2. Go to library → chapter should be marked as read (safety net marking)

**Manual mark as read still works:**
1. On chapter list, click the circle next to an unread chapter → should toggle to read (green check)
2. Click again → should toggle back to unread
3. These manual toggles should work independently of scroll tracking

**Edge cases:**
- Open a chapter briefly (< 3 seconds) → view should NOT be counted, chapter NOT marked read
- Open a chapter, wait 3+ seconds but don't scroll much → view counted but chapter NOT marked read
- Very short chapter (fits on one screen) → scrolling to bottom should hit 90% and mark as read

---

## Discovery Navigation & Profile Improvements (Feb 2025)

### Discover Dropdown (Desktop)
**Persona: Any user**
1. Visit any page on desktop
2. In the header nav, verify "Discover" appears next to Browse and Library
3. Click "Discover" — dropdown should appear with 8 links: Rising Stars, Most Popular, Most Followed, New Releases, Recently Updated, Community Picks, Genres, Tags
4. Each link should have an icon and short description
5. Click any link — should navigate to correct page
6. Click outside dropdown — should close
7. Verify chevron rotates when dropdown is open

### Discover Links (Mobile)
**Persona: Any user**
1. On mobile, open hamburger menu
2. Verify "Discover" section appears with: Rising Stars, Most Popular, New Releases, Community Picks, Genres
3. Click any link — navigates correctly, menu closes

### Billing Author Links
**Persona: Reader with author subscriptions**
1. Go to Settings → Billing
2. Scroll to "Author Subscriptions" section
3. Verify author names are clickable links (underline on hover)
4. Click an author name — should navigate to `/profile/{username}`

### Profile Tier Cards
**Persona: Reader viewing an author's profile**
1. Visit `/profile/{authorname}` for an author with enabled tiers
2. Verify tier subscription cards appear between stats grid and tabs
3. Cards should show: tier name, price, description, Subscribe button
4. If already subscribed: banner shows current tier status

**Persona: Author viewing own profile**
1. Visit your own profile
2. Tier cards should NOT appear (hidden for own profile)

### Profile Stories Tab Overflow
**Persona: Author with long story titles**
1. Visit profile with stories that have long words in titles
2. Verify titles wrap correctly within card boundaries (no horizontal overflow)
3. Verify blurbs also wrap properly

### Related Stories (Horizontal Layout)
**Persona: Any reader on a story page**
1. Visit any story page, scroll to "You Might Also Like"
2. Cards should display in horizontal layout (cover left, details right)
3. Should show: title, author, tagline/blurb, genres, stats (chapters, views, followers, rating, update time)
4. Compare to old layout — should feel richer and more informative

### Popular Page (Normalized Ranking)
**Persona: Any user**
1. Visit /popular
2. Subtitle should mention "views per chapter"
3. A 10-chapter story with high per-chapter views should rank above a 200-chapter story with lower per-chapter views
4. Sort dropdown still works (newest, updated)

### Author Route Deleted
**Edge case test:**
1. Try visiting `/author/{username}` — should show 404
2. Verify no internal links point to `/author/{username}` anymore
3. Story card "by Author" links should go to `/profile/{username}`

---

## Phase 2: XP Triggers & Daily Caps (Feb 2026)

### XP Award — Chapter Read
**Persona: Logged-in reader**
1. Read a chapter you haven't read before
2. Check your profile XP — should increase by +2
3. Read another chapter — XP should increase by another +2
4. Read 50 chapters in one day — after 50th, XP should stop increasing (100 XP/day cap)

### XP Award — Comment Posted
**Persona: Logged-in reader**
1. Post a comment on a chapter
2. Check profile XP — should increase by +3 (not +5, this was nerfed)
3. Post 10 comments in one day — all should award XP
4. Post an 11th comment — should NOT award XP (daily cap: 10 comments / 30 XP)

### XP Award — Chapter Like (Liker)
**Persona: Logged-in reader**
1. Like a chapter — your XP should increase by +1
2. Unlike the chapter — your XP should decrease by -1
3. Like 10 chapters in one day — all should award XP
4. Like an 11th chapter — should NOT award XP (10/day cap)

### XP Award — Comment Like (Author Reward)
**Persona: Two users — one comments, one likes**
1. User A posts a comment
2. User B likes User A's comment
3. User A's XP should increase by +2 (author reward, no cap)
4. User B's XP should NOT change (comment likes don't reward the liker)
5. User B unlikes — User A's XP should decrease by -2

### XP Award — Library Add
**Persona: Logged-in reader**
1. Add a story to your library (follow it)
2. Check XP — should increase by +2
3. Remove the story from library — XP should decrease by -2
4. Add 10 stories in one day — all should award XP
5. Add an 11th story — should NOT award XP (10/day cap)

### XP Award — Chapter Published
**Persona: Author with a story**
1. Create a new chapter and publish it (status = published)
2. Check your XP — should increase by +10
3. Create a draft chapter (don't publish) — XP should NOT change
4. Publish multiple chapters — each should award +10 (no daily cap)

### XP Daily Cap Reset
**Persona: Any user who hit a cap yesterday**
1. Hit the comment cap (10 comments, 30 XP) on day 1
2. On day 2, post a comment — should award +3 XP again (caps reset daily)

### XP — Edge Cases
**Persona: Any authenticated user**
1. Like your own comment — should NOT award XP (self-like check exists on comment_likes)
2. Verify XP never goes below 0 (floor at 0 in update_user_experience)
3. Check tier recalculation — if XP crosses a tier threshold, profile badge should update

---

## Phase 3: Achievement Evaluation Engine

### Achievement Auto-Unlock — Reading
**Persona: Any authenticated user**
1. Read your first chapter → should unlock "First Chapter Read" achievement + 10 XP bonus
2. Read 5 chapters → should unlock "First 5 Chapters" + 10 XP bonus
3. Read 10 chapters → should unlock "Chapters Read L1" + 25 XP bonus
4. Check Achievements page → newly unlocked should appear under Reading category
5. Read the same chapter again — should NOT create duplicate chapter_reads (depends on frontend dedup)

### Achievement Auto-Unlock — Writing
**Persona: Author with stories**
1. Publish your first chapter → should unlock "First Story Published" + "Chapters Published L1" + "Words Written L1"
2. Check XP log — should see +10 XP (publish) + multiple achievement bonuses
3. Publish 10 chapters → should unlock "Chapters Published L2"

### Achievement Auto-Unlock — Social
**Persona: Any authenticated user**
1. Post your first comment → should unlock "Comments Posted L1" + 15 XP
2. Like your first chapter → should unlock "Likes Given L1" + 5 XP
3. Add first story to library → should unlock "First Library Add" + 10 XP
4. Rate a story → should unlock "First Review" + 15 XP AND "Reviews Written L1" + 20 XP

### Achievement Auto-Unlock — Popularity (Author Side)
**Persona: Author whose story gets activity**
1. When someone follows your story → should evaluate followers_gained achievements
2. When someone rates your story → should evaluate ratings_received achievements
3. First follower → should unlock "First Subscriber" + 50 XP

### Achievement Idempotency
**Persona: Any user with existing achievements**
1. Perform the same action again (e.g., read another chapter when you already have L3)
2. Should NOT re-unlock already-earned achievements
3. Should only unlock the NEXT milestone if threshold is met

### Achievement One-Way Ratchet
**Persona: Any user with achievements**
1. Unlike a chapter (reducing likes_given count)
2. Check achievements — "Likes Given" achievements should NOT be revoked
3. Remove a story from library — "Library Size" achievements should NOT be revoked

### Border Unlock on Tier Up
**Persona: User approaching a tier threshold**
1. Earn enough XP to cross a tier boundary (e.g., 100 XP → regular)
2. Check profile borders — should unlock the tier-appropriate border (e.g., Bronze Ring at regular)

### Binge Reader Achievement
**Persona: Dedicated reader**
1. Read 20 chapters of the same story within 24 hours
2. Should unlock "Binge Reader" one-time achievement + 50 XP

---

## Phase 4: Scheduled Jobs & Remaining Tracks

### Reading Streak (Daily Cron)
**Persona: Active reader**
1. Read at least one chapter today
2. Verify `last_activity_date` updated to today in `user_experience`
3. Next day at 00:05 UTC, `process_daily_streaks()` runs
4. `current_streak` should increment by 1
5. `longest_streak` should update if new personal best
6. Read again next day → streak goes to 2
7. Skip a day → streak resets to 0 (but `longest_streak` preserved)
8. At streaks of 3, 7, 14, 30, 60, 100 → corresponding achievement unlocks

### Publishing Streak (Daily Cron)
**Persona: Active author**
1. Publish a new chapter (either insert as published, or flip draft→published)
2. Verify `last_publish_date` updated to today in `user_experience`
3. `process_daily_streaks()` increments `publishing_current_streak`
4. At streaks of 3, 7, 14, 30, 60 → publishing streak achievement unlocks
5. Skip a day → publishing streak resets to 0

### Profile Completed Achievement
**Persona: Any user**
1. Fill in all 4 profile fields: display_name, bio, avatar_url, genre_preferences
2. Should instantly unlock "Profile Completed" achievement + bonus XP
3. Clearing a field later does NOT revoke the achievement

### Premium Member Achievement
**Persona: Subscribing user**
1. Upgrade to premium (`is_premium` flips to true)
2. Should instantly unlock "Premium Member" achievement + bonus XP

### Story Views Achievement (Author)
**Persona: Popular author**
1. Author's stories accumulate views
2. Achievement only evaluates when total views cross thresholds: 100, 1K, 10K, 50K, 100K, 500K
3. Not evaluated on every single view (performance optimization)

### Ranking Achievements (After Daily Snapshot)
**Persona: Ranked author**
1. Daily ranking snapshot runs at midnight UTC
2. If author's story appears in rankings → evaluates: peak_rank, rising_stars, weeks_top_50
3. peak_rank: unlocks at rank ≤50, ≤25, ≤10, ≤5, =1 (across all pages except rising-stars)
4. rising_stars: unlocks at appearing on list, top 10, #1 (rising-stars page only)
5. weeks_top_50: counts distinct weeks with any rank ≤50 → unlocks at 1, 4, 12, 26, 52 weeks

### Veteran/Loyal Reader (Daily Cron)
**Persona: Long-term user**
1. `process_daily_account_age()` runs at 00:10 UTC
2. Users with account created exactly 12 months ago today → "Veteran Reader" unlocks
3. Users with account created exactly 24 months ago today → "Loyal Reader" unlocks

### Community Pick (Admin Function)
**Persona: Admin**
1. Run: `SELECT award_community_pick('story-uuid-here');`
2. Story's author receives "Community Pick" achievement + bonus XP
3. Running again returns "Already awarded" message

### Idempotency Check
1. Run `snapshot_rankings()` twice → second run should show 0 achievements unlocked
2. Run `process_daily_streaks()` twice on same day → no double increments
3. Re-run `process_daily_account_age()` → 0 unlocks (already awarded)

---

## Phase 5: Achievement UI Tests

### Achievement Page Layout (Any Logged-In User)
1. Navigate to `/achievements` → page loads with all sections visible
2. **XP & Level Card** → shows current tier badge, XP number, progress bar to next tier
3. **Streak Section** → shows "🔥 Streaks" card. If user has active streaks, shows flame/pen with day count. If no streaks, shows "No active streaks" message
4. **Recently Unlocked** → shows last 5 achievements with icons and "Unlocked X ago" timestamps. Hidden if user has 0 achievements
5. **Overall Progress** → X/146 count with progress bar, 6 category breakdowns with icon + count
6. **Featured Badges** → "Edit Badges" button opens sheet with selectable badges (max 5)
7. **Category Tabs** → All / Reading / Writing / Social / Popularity / Rankings / Special all filter correctly

### Track-Based Achievement Grid
1. **Progressive tracks** → shown as single card per track with:
   - Track icon and name (e.g., "📚 Chapters Read")
   - Current progress vs next milestone (e.g., "235 / 500")
   - Progress bar fills based on current value
   - Row of milestone badges (colored = unlocked, gray = locked)
   - Tooltip on milestone badges shows description + threshold
   - Fully completed tracks show "✅ Complete!" with gold border
2. **One-time achievements** → shown as individual cards (locked/unlocked)
3. **Ranking tracks** → progress shows "Rank X / Top Y" (inverse — lower is better)
4. **Sort order** → tracks with more progress appear first, completed tracks sorted last

### Profile Page Streaks
1. Navigate to any user's profile → if they have active streaks, inline badges appear below header
2. Streak badges show "🔥 X day reading streak" and/or "✍️ X day publishing streak"
3. If no active streaks, nothing is shown (no empty section)
4. Achievement count shows "🏆 X achievements" in profile header info line

### Edge Cases
1. New user with 0 achievements → page shows empty states gracefully, no "Recently Unlocked" section
2. User with ALL achievements → all track cards show "✅ Complete!" with gold styling
3. Category tab with 0 achievements → shows "No achievements to display" message
4. Mobile view → achievement grid responsive (1 col), recently unlocked horizontally scrollable

---

## Reading Experience Audit Fixes (PR #28)

### Continuous Scroll — Read Tracking & State
1. Open a multi-chapter story in Continuous Scroll mode
2. Scroll past the end of chapter 1 (past the separator) → `chapter_reads` row written for chapter 1
3. Scroll past chapter 2 content → `chapter_reads` row written for chapter 2
4. Verify in paged mode: scrolling to 90% marks chapter as read; reading_progress NOT double-written (no race with ContinuousScrollReader)
5. In continuous scroll: Prev/Next buttons on mobile bottom nav are **disabled** (greyed out), not clickable

### Scroll Progress Bar
1. Open a story starting at chapter 7 in continuous scroll → progress bar label shows **"Ch. 7"** not "Ch. 1"
2. Load multiple chapters → label updates correctly as you scroll between chapters

### Keyboard Navigation
1. Open reading settings sheet (desktop) → press Escape → sheet closes, **stays on chapter page**
2. Close the sheet → press Escape → navigates back to story page ✓

### Swipe Navigation (Mobile)
1. Open a chapter with a data table or wide code block → swipe horizontally inside it → **no chapter navigation triggered**
2. Swipe diagonally (mostly vertical) → no chapter navigation triggered
3. Clean horizontal swipe in content area → navigates to next/prev chapter ✓

### Shareable Quote (Mobile)
1. Select 10–280 characters of chapter text on mobile → share popup appears **directly above selection** (not offset down by scroll amount)
2. Tap outside popup → dismisses ✓
3. Tap share/copy buttons → work correctly ✓

### Immersive Mode (Mobile)
1. Tap the middle of a chapter content area → immersive mode toggles (header/footer hide)
2. Tap a **spoiler span** → spoiler reveals but immersive mode does **not** toggle

### Locked Chapter Overlay
1. Log in as a user who previously marked a locked chapter as read
2. Navigate to that locked chapter → overlay shows **"Mark as unread"** button immediately (not "Mark as read")

### Resume Toast
1. Read a chapter, scroll to ~50%, navigate away
2. Return to the chapter → "Resuming where you left off" toast appears with **✕ button**
3. Click ✕ → toast dismisses immediately
4. Toast also auto-dismisses after ~3 seconds if not clicked

### Comment Sort Persistence
1. Open comments on a chapter → change sort to "Oldest"
2. Navigate to another chapter and back → sort dropdown still shows **"Oldest"** (persisted)

### Comment Count
1. Open a chapter with threaded comments (replies exist)
2. "Comments (N)" heading counts **top-level + all replies** combined

### Reading Themes & Brightness
1. Switch to **Sepia** or **Night** reading theme
2. Comment textarea and sort dropdown match the theme colours (no jarring white box)
3. Drag brightness slider to 70% → **entire reading area dims** (header chrome + content, uniformly)
4. Brightness at 100% → no visible difference from default

### Offline Cache Cap
1. Read 50+ chapters across multiple stories while online
2. Open DevTools → Application → IndexedDB → fictionry-offline → chapters
3. Entry count should not exceed **50**; oldest entries evicted first

---

## Mobile / PWA Audit Fixes

### Safe Area (iOS notch / home indicator)
1. On iPhone (or Chrome DevTools with iPhone 14 Pro simulator):
   - Cookie consent banner clears the home indicator (does not overlap it)
   - Offline indicator clears the notch/Dynamic Island at the top
   - PWA install prompt, scroll-to-top button, and resume toast all float above the mobile nav + home indicator
   - Reader article bottom padding is sufficient — last line of text not obscured by nav bar or home indicator
2. Switch to Reader → verify reader bottom nav itself has `safe-area-bottom` padding

### iOS Input Zoom Prevention
1. On iOS Safari, tap the email or password field on `/login` or `/signup`
2. Page should **not** zoom in — font size is 16px (text-base)
3. Tap any comment textarea in the reader → no zoom

### Dynamic Viewport Height
1. Navigate to `/` on iOS Safari with the address bar visible
2. No content should be cut off by the collapsing browser bar

### Overscroll / Pull-to-Refresh
1. On Chrome Android, pull down hard from the top of any page
2. Pull-to-refresh should be suppressed (page stays put)

### Prefers Reduced Motion
1. Enable "Reduce Motion" in device accessibility settings (or emulate via DevTools)
2. Open reader → immersive mode hide/show transitions should be near-instant
3. Spoiler reveal, menu animations all suppressed

### PWA Install & Manifest
1. Open DevTools → Application → Manifest
   - `scope` is `/`
   - `shortcuts` array has 3 entries: Browse, Library, Write
2. On Android Chrome: long-press app icon after installing → context menu shows shortcut options

### Auth Autocomplete / Password Manager
1. Open `/login` on iOS Safari or Chrome
2. Tap email field → AutoFill / password manager suggests saved credentials
3. Tap password field → suggests saved passwords for fictionry.com
4. Open `/signup` → new-password AutoFill triggered (offers to save)

### Touch Targets (Reader Nav)
1. In Reader on mobile, check Prev / Next / Settings buttons in bottom nav
2. All buttons should have a minimum 44×44pt touch target (no missed taps)

### Storage Quota Guard
1. Simulate low storage: DevTools → Application → Storage → "Simulate storage pressure" (or manually fill storage)
2. Navigate to a chapter online — caching should be skipped gracefully with console warning, no crash

### Progress Bar ARIA
1. Open a chapter page with a screen reader active (VoiceOver / TalkBack)
2. Scroll down → progress bar should announce reading percentage

### Offline Indicator Safe Area
1. Disable Wi-Fi on iPhone with notch
2. Offline banner at the top should not overlap the Dynamic Island/notch — sits below it
