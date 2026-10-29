# Pat's Postcard World

*A little postcard from my corner of the world.*

**Live site:** [patriciaorenza.github.io/pats-postcard](https://patriciaorenza.github.io/pats-postcard/)

This is my personal corner of the internet, a scrapbook-style site for friends, people I meet online and anyone who wants to know me beyond a CV. My professional portfolio lives at [patriciaorenza.github.io](https://patriciaorenza.github.io/).

## What's inside

- **The shot:** the site opens with me taking a three-pointer on a sunset court.
- **About me:** a passport with my details and travel stamps.
- **Daily essentials:** scroll to unpack what's in my bag.
- **My room:** tap the + signs to explore:
  - **Laptop:** my links and freelance work
  - **Globe:** places I've been, plus postcards from visitors
  - **Basketball:** what the game taught me, with a one-shot mini-game
  - **Note board:** a wall where visitors can leave notes
  - **Phone:** a way to say hello
- **Say hello:** leave a message or send a postcard from wherever you are.

## How it's built

- One `index.html` with plain HTML, CSS and JavaScript. There's no framework and no build step.
- [GSAP](https://gsap.com/) and ScrollTrigger for animation, stored locally in `vendor/`.
- Fonts and images are stored locally in `fonts/` and `assets/`.
- [Supabase](https://supabase.com/) stores visitor notes, postcards and contact messages:
  - Visitors can only add these; contact messages can never be read publicly.
  - Postcards only show on the globe once I approve them.
  - Notes appear straight away, unless the database's word and link filter flags them for me to review.
  - Each connection is rate-limited.
- Hosted on GitHub Pages from the `main` branch.

## Database setup

To set up the database from scratch, run these files in the Supabase SQL Editor, in this order:

1. `supabase-postcards.sql`
2. `supabase-notes-contacts.sql`
3. `supabase-contacts-message.sql`
4. `supabase-hardening.sql`

`supabase-audit.sql` is a read-only check of the tables' access rules.

See [CHANGELOG.md](CHANGELOG.md) for what changed, what was fixed and what is outstanding.

---

Made by Patricia Orenza · Singapore
