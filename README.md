# Hazel Daily

Daily Telegram morning brief for Hazel.

It sends one message every morning with:

- a short good-morning greeting for Hazel
- one English slang phrase with explanation and example
- one outfit suggestion tailored to Hazel's profile, Chicago weather, and saved references

## Setup

1. Create a new GitHub repository named `hazel-daily`.
2. Push this project to that repository.
3. Add these GitHub Actions secrets:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
4. Enable GitHub Actions.
5. Run `Daily Hazel` once from the Actions tab to verify delivery.

## Schedule

- Daily at `7:30 AM` Chicago time

## Image Generation

This first version sends text only.

The project is intentionally structured so an image-generation step can be added later:

- add an image API secret
- generate one look reference image each morning
- send the image to Telegram before or together with the text brief

## Structure

- [scripts/send-telegram-hazel.mjs](/Users/ken/Documents/New%20project/hazel-daily/scripts/send-telegram-hazel.mjs): builds and sends the daily brief
- [scripts/should-run-daily.mjs](/Users/ken/Documents/New%20project/hazel-daily/scripts/should-run-daily.mjs): Chicago time gate for GitHub Actions
- [data/hazel-profile.json](/Users/ken/Documents/New%20project/hazel-daily/data/hazel-profile.json): Hazel's structured profile
- [references/style-profile.md](/Users/ken/Documents/New%20project/hazel-daily/references/style-profile.md): human-readable style rules
- [references/outfits/notes.md](/Users/ken/Documents/New%20project/hazel-daily/references/outfits/notes.md): reference image learnings

