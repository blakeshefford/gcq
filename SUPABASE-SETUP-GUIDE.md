# Global Connection Quest — Supabase safety-net build

This is a self-contained version of the app that uses **your own Supabase
database** instead of Claude's artifact storage. It's completely independent of
the Claude platform: you host the single HTML file anywhere and it just works,
with no plan limits, no logins, and full control of the data.

Use this if the published-artifact version ever lets you down, or if you'd
simply rather own the backend.

## Files
- `GlobalConnectionQuest-Supabase.html` — the entire app, one file.
- `supabase-setup.sql` — run once to create the database table.

## One-time setup (about 10 minutes)

1. **Create a free Supabase project** at supabase.com → New project. Pick a
   region close to Tokyo (e.g. Northeast Asia / Tokyo) for lowest latency.

2. **Create the table.** In the project, open **SQL Editor → New query**, paste
   the contents of `supabase-setup.sql`, and click **Run**.

3. **Get your two keys.** Go to **Project Settings → API**. Copy:
   - **Project URL** (looks like `https://abcdxyz.supabase.co`)
   - **Project API keys → anon / public** (a long string)

4. **Paste them into the HTML.** Open `GlobalConnectionQuest-Supabase.html` in
   any text editor. Near the top you'll see:
   ```
   const SUPABASE_URL = "https://YOUR-PROJECT-ref.supabase.co";
   const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
   ```
   Replace both values, save the file. (If you skip this, the app shows a
   "Setup needed" screen instead of failing silently.)

5. **Host the file so phones can reach it.** Easiest option: go to
   **app.netlify.com/drop** and drag the HTML file onto the page — you get a
   public URL in seconds, free, no build step. (Vercel, Cloudflare Pages,
   GitHub Pages, or any static host work too.) That URL is your event link.

## On the day
Identical to the published version:
- Attendees open the link → **Continue** → register.
- Big-screen device opens the link → **Venue screen →**.
- You open the link → **Gamesmaster access →** → PIN `tokyo2026`.

## Good to know
- **Anyone with the link + the anon key can read/write the data.** That's the
  same open trust model as the artifact version and is fine for an internal
  event. The app never deletes data, and each write uses a unique key, so
  concurrent phones can't overwrite each other.
- **To reset for a rehearsal vs the real event**, run `truncate table
  public.kv;` in the SQL editor (the line is at the bottom of the setup script).
- **Change the admin PIN** before go-live: search the HTML for
  `ADMIN_PIN = "tokyo2026"`.
- **Latency**: the app polls every ~12–20s, so a Tokyo-region database keeps the
  leaderboard feeling live without hammering the API.

## Editing content later
The same constants from the main build are at the top of the HTML: `MARKETS`,
`APAC_FACTS`, `APAC_QUIZ`, `ICEBREAKERS`, `JAPAN_FACTS`, scoring (`PTS`), ranks,
and missions. Edit, save, re-host.
