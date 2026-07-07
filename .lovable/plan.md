# Admin → System (Τεχνικά site)

Νέα admin σελίδα `/admin/system` (admin-only) που συγκεντρώνει όλα τα τεχνικά/λειτουργικά στοιχεία του site σε ένα dashboard.

## Τι θα βλέπει ο admin

**1. Domain & Hosting**

- Preview URL, Published URL, Custom domains (αν υπάρχουν)
- Publish status + visibility (public/private)
- Hosting: Lovable (Cloudflare Workers edge runtime)
- Region/edge info, τελευταίο deploy timestamp

**2. Backend (Lovable Cloud)**

- Cloud status (ACTIVE_HEALTHY / restarting / κτλ) με χρωματιστό badge
- Database: πλήθος πινάκων, μέγεθος, connections
- Storage: buckets, συνολικό μέγεθος αρχείων
- Auth: σύνολο χρηστών, νέοι (7d), τελευταία σύνδεση

**3. AI Usage & Tokens (Lovable AI Gateway)**

- Credits: υπόλοιπο workspace, χρήση τρέχουσας περιόδου
- Τελευταίες 20 AI κλήσεις (μοντέλο, tokens, cost, status, timestamp)
- Aggregates 7d/30d: σύνολο requests, tokens (in/out), cost, error rate
- Group by model + operation

**4. API & Secrets**

- Λίστα configured secrets (μόνο ονόματα, όχι τιμές)
- Λίστα ενεργών connectors (Google Maps κτλ.)
- Public API endpoints του project (`/api/public/*` αν υπάρχουν)
- Supabase publishable key (masked), URL

**5. Runtime & Performance**

- Node/runtime info, build version (commit hash αν διαθέσιμο)
- Server function endpoints count
- Πρόσφατα server errors (τελευταία 24h) από τα logs

## Δομή

- Route: `src/routes/_authenticated/admin.system.tsx` (admin-only, όχι editor)
- Nav item "System" στο `AdminShell` με `adminOnly: true` + `Server` icon
- Server functions σε `src/lib/system.functions.ts`:
  - `getSystemInfoQueryOptions()` → domain/hosting/backend/secrets/DB/storage/auth counts
  - `getAiUsageQueryOptions(range)` → credits + aggregated AI stats
  - `getRecentAiCallsQueryOptions(limit)` → πρόσφατες κλήσεις
- Όλα με `.middleware([requireSupabaseAuth])` + έλεγχος `has_role(admin)`

## Πηγές δεδομένων (mapping)


| Section        | Πηγή                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| URLs / publish | Env vars (`VITE_SUPABASE_URL`, project URL) + hardcoded από γνωστά project URLs                                                                  |
| Cloud status   | Query στο `information_schema` για DB size/tables, `storage.objects` για storage size, `auth.users` count                                        |
| AI usage       | Fallback: aggregation από `analytics_events` αν καταγράφονται· διαφορετικά placeholder με μήνυμα "Διαθέσιμο μέσω Lovable dashboard" + link       |
| Secrets        | Στατική λίστα ονομάτων που ξέρουμε ότι χρησιμοποιούνται (Google Maps browser key, Supabase keys)· δεν γίνεται runtime enumeration από τον server |
| Errors         | Query σε `analytics_events` με type='error' αν υπάρχει, αλλιώς κενό state                                                                        |


Σημαντικό: τα Lovable-workspace credits/AI logs (list_ai_gateway_requests, get_credit_balance) είναι εργαλεία της πλατφόρμας Lovable — δεν είναι προσβάσιμα runtime από το app. Στη σελίδα θα εμφανίζεται σχετική ενημέρωση με link στο Lovable dashboard για αυτά τα πεδία, ενώ τα υπόλοιπα (DB, storage, users, domain, secrets) θα είναι πλήρως live.

## UI

- Grid από `Card`s με κατηγορίες, KPI numbers πάνω, λεπτομέρειες κάτω
- Badges για status (healthy/warning/error)
- Copy-to-clipboard σε URLs/keys
- Refresh button + auto-refresh κάθε 30s για status
- Πίνακας για πρόσφατες AI κλήσεις με filtering by model

## Τεχνικές λεπτομέρειες

- Χρήση `useSuspenseQuery` με `ensureQueryData` στον loader (κάτω από `_authenticated`, ασφαλές)
- DB queries μέσω `context.supabase` (RLS as admin user)· auth.users count μέσω `supabaseAdmin` (dynamic import μέσα στον handler)
- Head: `title: "System — RIBALI Admin"`, `robots: noindex`

Πρόσβαση  
Αυτά όλα θα είναι προσβάσιμα μόνο σε admin level