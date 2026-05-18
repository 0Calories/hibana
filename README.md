# Hibana

**Ignite your good habits and extinguish the bad!**

A modern habit tracking and productivity app that helps you stay on track to becoming the best version of yourself. Create tasks, track habits, take notes, and plan your schedule, all in one beautifully designed interface.

Built with the latest web technologies for a fast, responsive experience

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Supabase** (Database + Auth)
- **Tailwind CSS** + **shadcn/ui**
- **TypeScript**

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# Marketing waitlist (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_WAITLIST_SEGMENT_ID=your_resend_waitlist_segment_id

# Cloudflare Turnstile
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

The publishable key (`sb_publishable_...`) is safe to expose in the browser and
is used by the client and SSR Supabase clients. The secret key (`sb_secret_...`)
must never be exposed publicly — it is only read server-side for privileged
operations that bypass RLS.

For local development, run `pnpx supabase start` and copy the `Publishable key`
and `Secret key` it prints into your `.env.local`.

The waitlist form on the marketing page posts to the Resend Audiences API and
verifies submissions with Cloudflare Turnstile. Create an Audience in the
[Resend dashboard](https://resend.com/audiences) and a Turnstile site in the
[Cloudflare dashboard](https://dash.cloudflare.com/?to=/:account/turnstile);
copy the IDs/keys into the variables above.
