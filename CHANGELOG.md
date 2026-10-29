# Changelog

All notable changes to **Pat's Postcard**, newest first. Each entry names the commit it shipped in.

Database changes are listed separately under each release, because they're applied in Supabase, not deployed by GitHub Pages.

- **Live site:** https://patriciaorenza.github.io/pats-postcard/
- **Database:** Supabase project "PatriciaOrenza Portfolio"

---

## 2026-10-30: Phase 6 tidy-up

Nothing visible changes except faster loading and link previews. Before shipping, 13 views on desktop and mobile were compared pixel by pixel against the previous version: identical apart from invisible compression differences in the bag and logo. All earlier functional tests were rerun and pass.

### Changed
- **Code split into files:** `css/site.css`, plus `js/01-intro.js` … `js/06-world.js`, in the original order. `index.html` went from 225 KB to 43 KB.
- **CSS:** removed 214 leftover rules from earlier versions that could never apply (CSS down from 105 KB to 83 KB).
- **Images:** `bag.png` → `bag.webp` (180 KB → 22 KB) and `logo.png` → `logo.webp` (66 KB → 38 KB). The PNGs are kept in `assets/`.

### Added
- **Icons:** favicon (`favicon-32.png`) and iPhone home-screen icon (`apple-touch-icon.png`): a cream italic "P" on burgundy.
- **Link previews** for LinkedIn, WhatsApp and others, using an image of the real hero (`og.jpg`) and the tagline.
- **Meta description** is now the tagline, "A little postcard from my corner of the world."

### Security
- **Browser security policy:** scripts are now allowed only from this site (`script-src 'self'`; `'unsafe-inline'` removed). This closes issue 3 from the security review.

### Removed
- The merged `intro-polish` preview branch.

---

## 2026-10-30: User-test fixes and security hardening

Found by a simulated usability test (3 personas × 9 tasks) and a security review.

### Fixed
- **Phones: travel story card cut off on the left.** The flag row overflowed the screen, so selecting a flag scrolled the whole globe window sideways. The flag row now scrolls on its own. `c22c069`
- **Phones: story card covered "Leave a postcard!"**, and stayed open after closing and reopening the globe. On phones the floating button now steps aside while a card is open, the card has its own "send a postcard" button, and closing the globe closes the card. `c22c069`
- **Keyboard: focus landed on invisible bag items.** Tabbing onto a still-packed item now unpacks the bag first. `c22c069`

### Security
- **Notes wall flood risk (medium).** The per-visitor limit read a header that senders can fake, and notes publish instantly. The visitor is now identified from `cf-connecting-ip`, and notes are capped at 60 per hour site-wide. `bda53d7` (SQL file)
- Review passed: no secret keys in the files or the Git history; visitors can't read contacts, edit or delete rows, or approve or unflag their own posts; all visitor text is escaped before it's shown.

### Database
- `supabase-hardening.sql` applied to the live project on 30 Oct, through the Supabase connector, and verified.

---

## 2026-10-22: Intro polish and mobile fixes

### Changed
- **Intro looks less cartoonish.** `06ebc0d`
  - New graded court image (`court-grade.webp`), toned toward the site palette with a soft background blur.
  - Poses relit for a backlit sunset with a warm rim light (`pose-*-lit.webp`).
  - Long ground shadow cast like the palms' shadows (`pose-*-shadow.webp`).
  - Player about 15% larger, with a knee dip before the jump and a lower jump.
  - Near-cuts between poses (no ghosting), a slow 5% push-in, and light static film grain.
  - Intro images went from about 500 KB to about 280 KB. Original images are kept.
- **Globe legend reworded.** It now reads "places I've been" / "postcards from visitors (n)". `d247912`

### Fixed
- **Phones: bag items jumped while scrolling.** Item images now reserve their size before loading, and the scroll animation ignores iOS address-bar resizes. `b138cc2`
- **Phones: smeared, blurred band above and below the room.** The old mobile image had stretched fake pixels. It's replaced by `room-mobile.jpg`, built from the real photo: a plain band in the section colour for the heading, and a short fade into the postcard row. `b138cc2`
- **Globe legend.** "Be the first!" read as part of "places I've been", and the legend ran under the close button on phones. `d247912`
- **Two close buttons overlapped** when the postcard form was open. The globe's close button now hides while the form is open. `d247912`

---

## 2026-10-21: Audit fixes and content

### Added
- **Postcard row under the room**: Places I've been · Off the court · My work · Leave a note. Each opens the same pop-up as its + sign. `e215bf2`
- **Optional message box** on the phone contact form (Name → Message → Email). `f1a3d4d`
- **Globe legend count** of approved postcards. `e215bf2`
- **README** with the tagline "A little postcard from my corner of the world." `c604d20`
- **Shared `PatModal` helper**: keyboard focus stays inside open pop-ups, and the page behind is inert. `6ca709a`

### Changed
- **Coach stamp** now reads "Basketball Coach / STEM Trainer"; Hoop Nation is shown as 2022–2026. `e215bf2`
- **Education** shows "Class of 2026" in the passport and bio; "graduate university" removed from the room to-do list. `e215bf2`
- **Intro** is now just the shot, fading into About after the ball drops through the net (about 2.5 s). The unused "Shoot it." finale was removed. `26b31ca`
- **Small mono labels** use a darker mauve (#985260, 5.3:1 contrast, up from 3.5:1). `6ca709a`
- **Supabase project.** The site moved from the old `wcureqxjhjupqsihwufo` project, which wasn't in Pat's account, to "PatriciaOrenza Portfolio". `b14bb2d`

### Fixed
- **Notes showed "stuck it on the wall :)" even when the save failed.** Success is now shown only after the database confirms; on failure the text is kept. `8410972`
- **All forms showed one generic error.** They now show the database's own reason (for example the rate limit); other errors stay generic. `8410972`
- **Notes were copied into the visitor's browser storage.** No longer. `8410972`
- **Keyboard focus escaped from pop-ups**, and Escape in the postcard form closed the whole globe. `6ca709a`
- **Reduced motion:** 11 looping animations kept running; now all CSS loops stop. `6ca709a`
- **Re-running `supabase-postcards.sql` would have restored the weaker md5 spam guard.** Removed. `8410972`

### Database
- `supabase-notes-contacts.sql` applied on 21 Oct, by Pat in the SQL Editor:
  - `notes` and `contacts` tables with row-level security and column-level grants.
  - Word and link filter that flags suspicious notes and hides them until reviewed.
  - Per-visitor rate limits and a secret-salted connection hash.
- `supabase-contacts-message.sql` applied on 21 Oct, by Pat: adds an optional `message` column to `contacts`.

---

## 2026-10-21: Baseline

- **v11 baseline** imported unchanged from the project archive. `8ce128d`

---

## Known issues and outstanding work

- **Placeholders:** Freelance work (3 "coming soon" cards), 8 of 10 travel stories, 4 of 5 basketball chapter photos and the Photos app are waiting for Pat's content.
- **Professional portfolio** is only reachable inside the laptop or via an unlabelled briefcase icon.
- **Untested on real devices:** Safari on iPhone behaviour, and whether the spoof-resistant rate limit holds under real traffic.
- **Accepted (GitHub Pages can't set these headers):** no clickjacking protection; this site and the professional portfolio share one browser origin.
- **Link previews** are cached by each platform. If an old preview shows on LinkedIn, refresh it with LinkedIn's Post Inspector.
