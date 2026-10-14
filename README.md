# Musme website

Marketing site for [musme.co](https://www.musme.co), built with Next.js 16 (App Router), React 19, TypeScript, and deployed on Vercel.

## Development

```bash
pnpm install
pnpm dev
```

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`.

## Maintenance

- **Renew `public/.well-known/security.txt` before 2027-10-14.** Its `Expires` field must be moved forward every year. Once it lapses, security researchers no longer treat it as a valid reporting route.
- **Keep the GEO files in sync.** `public/llms.txt`, `public/llms-full.txt` and `public/index.md` are maintained by hand. When page copy changes, update them and bump `LAST_UPDATED` in `components/ContentPage.tsx` along with the visible "Updated" dates.
- **`robots.txt` repeats `Disallow: /api/` in every bot group.** A crawler with its own group ignores the `*` group, so each named group needs the rule too.
- **`script-src` keeps `'unsafe-inline'` on purpose.** Read the comment in `next.config.ts` before tightening the Content Security Policy.
