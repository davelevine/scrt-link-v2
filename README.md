# scrt-link-v2

**Encoded** is a secure secret-sharing platform. Secrets are encrypted on the client before being sent to the server — the server never sees the plaintext. Once a secret has been viewed (or expires), it is permanently deleted. It is free; there is no billing or subscription system.

Built with [SvelteKit](https://svelte.dev) and [TypeScript](https://www.typescriptlang.org/).

Live: [encoded.org](https://encoded.org)

> Open-source, self-hostable fork of [scrt.link](https://scrt.link) by [@stophecom](https://github.com/stophecom).

## Developing

```bash

# 1. Install dependencies
pnpm install

# 2. Start DB (via Docker)
pnpm run db:start

# 3. Start sveltekit
pnpm run dev

# Run tests (unit and e2e)
pnpm test
```

## Database

Using Drizzle with Postgres.
Runs in Docker locally.

```bash
# You will need to set POSTGRES_URL in your production environment
# Reminder to myself: Using 5433 as port to not have conflict with local Postgres: https://stackoverflow.com/a/76448218

pnpm run db:start  # Start the docker container
pnpm run db:push # Update your database schema

# Local DB with Docker
docker compose up

```

## Building

To create a production version of your app:

```bash
pnpm run build

```

## Cron

We use Vercel Cron to cleanup secrets and files.
See `src/routes/api/v1/cron/+server.ts` for more info.

You can trigger the cron job locally with:

```bash
curl --request POST \
     --url 'http://localhost:5173/api/v1/cron' \
     --header 'Authorization: Bearer CRON_SECRET'

```

## UI / Components

https://www.shadcn-svelte.com/

```bash
# Install component (e.g. form)
pnpm dlx shadcn-svelte@latest add form
```

## Translations / i18n

Translations are done with [Paraglide.js by Inlang](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)

```bash
# See project.inlang/settings.json for configurations.
# Add/edit source strings in messages/en.json only; the other locales are
# generated. After adding keys, translate them into every locale, then:
pnpm cleanup-translation-keys   # remove keys no longer referenced in src/
pnpm deduplicate-translations   # collapse duplicate identical strings
```

### Usage

```ts
import { m } from '$lib/paraglide/messages.js';

// Sherlock IDE Extensions helps managing strings
const someString = m.elegant_muddy_wren_value();
```

## Authentication

Implementation based on [Lucia](https://v2.lucia-auth.com/database-adapters/postgres/)

The following login methods are available:

- Email & Password (with email verification & password reset)
- OAuth with Google

### Google OAuth Client

Redirect URI: `/login/google/callback`

## Transactional Emails

- Delivered via [Lettermint](https://lettermint.co) (`src/lib/server/resend.ts` — filename is legacy). Set `LETTERMINT_TOKEN` and `EMAIL_FROM` (from-address domain must be verified in Lettermint).
- Email templates with [svelte-email-tailwind](https://github.com/steveninety/svelte-email-tailwind)
- Structure:

```bash
📦 Project
├── 📂 src
│ └── 📂 lib
│   ├── 📂 emails                 # Email templates
│   └── 📂 server/resend.ts       # Lettermint sender
│
└── 📂 routes/(app)/(default)/account/admin/email-previews # Preview emails (admin only)
```

## Workflows / E2E Testing

In order to ship with confidence we run a set of tests during and after the deployment.
See `playwright-tests-published.yml` for more info.

### Bypass Vercel Environment Protection

By default Vercel preview builds are protected and therefore can't be accessed by e2e-tests.
Solution:

- https://community.vercel.com/t/github-vercel-playwright-e2e-using-automation-bypass-secret/1093/2
- [Vercel Docs](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)

## API

Since all secrets need to be encrypted on the client, the API relies on proper client-side handling. Therefore, API validation is not very strict.

### Authentication

You can get an API key (bearer token) on the account page. API access is available to every account.

### Endpoints

> /api/v1/secrets

Used to create secrets programmatically. To interact with the API, use the client-module. (See below)

```bash
# example.http
# IMPORTANT. The following is just for documentation purposes. Use the client-module to interact with the API.

# Post Secret
POST https://encoded.org/api/v1/secrets HTTP/1.1
Content-Type: application/json
Authorization: Bearer {{apiAccessToken}}

{
  "secretIdHash": "480bda04dbf90e580fe1124ff050ad1481509478521dc12242173294d9fec4be",
  "publicKey": "-----BEGIN PUBLIC KEY-----\nMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEbR5G6VDGfn8kPSE7y8MHY9PaWdgej1zz8nv6mN202pgOzuOzh221LoSFRprLhPqn9ykO+ZmvEMYVZa6+Wfk5GhEZpHl4QtJOGxH8rLhKqbLTJiBsLyXK0xm1u2N/UO1X\n-----END PUBLIC KEY-----",
  "meta": "XYZ", # Encrypted
  "content": "XYZ", # Encrypted
  "publicNote": "Lorem ipsum", # This is saved as plain text.
  "password": "my-secret-password", # Optional. Can be omitted.
  "expiresIn": 3600000 # Time in ms.
}

```

### Client Module

Usage in Node.js / Browser:

```html
<script type="module">
	import { scrtLink } from 'https://encoded.org/api/v1/client-module';

	// Instantiate client with API key.
	const client = scrtLink('ak_NcOWw69xw7XDjMK6QSYrw4LDlMOKYMK2F8Oqw4hoeMKiwrk5FcOLY1pqwqscdcOQ');

	// Basic usage
	client.createSecret('Some confidential information…').then(console.log);

	// With options
	client
		.createSecret('https://example.com', {
			secretType: 'redirect' // text | redirect | neogram
			password: 'foobar123'
			expiresIn: 86400000,
			publicNote: 'Bitcoin wallet address',
			host: 'br3f.com', // For white-label / business
		})
		.then(console.log);
</script>
```

Example response:

```json
{
	"secretLink": "https://encoded.org/s#gOOei~kEkcYAAX-YJQnGooSXdSJg8MXkzk~2",
	"receiptId": "D0waygL3",
	"expiresIn": 86400000,
	"expiresAt": "2025-04-24T16:15:52.172Z"
}
```

#### Build npm client module

More info in packages/client.

```bash
# Build package
pnpm --filter @scrt-link/client build

# Publish package
cd packages/client
npm login
npm version patch
npm publish --access public
```

### CLI

Install and use the `scrtlink` CLI to create encrypted secrets from the command line.

```bash
# Install globally
npm install -g @scrt-link/cli
```

#### Usage

```bash
# Set your API key once (or pass --api-key per command)
export SCRT_LINK_API_KEY=ak_...

# Basic — prints the secret link to stdout
scrtlink "super-secret-password"

# With options
scrtlink "https://example.com" \
  --type redirect \
  --expires 1h \
  --views 5 \
  --password "unlock123"

# White-label instance
scrtlink "my secret" --host br3f.com
```

Options:

| Flag         | Description                       | Default     |
| ------------ | --------------------------------- | ----------- |
| `--type`     | `text` \| `redirect` \| `neogram` | `text`      |
| `--expires`  | `1h` \| `1d` \| `1w` \| `1m`      | `1w`        |
| `--views`    | View limit 1–1000                 | `1`         |
| `--note`     | Public note shown before reveal   | —           |
| `--password` | Password-protect the secret       | —           |
| `--host`     | Override API host (white-label)   | `scrt.link` |
| `--api-key`  | API key (overrides env var)       | —           |

The command prints the secret link to stdout, making it pipeable:

```bash
scrtlink "my secret" | pbcopy
echo "my secret" | xargs scrtlink
```

#### Build & publish

```bash
# Build
pnpm --filter @scrt-link/cli build

# Publish
cd packages/cli
npm login
npm version patch
npm publish --access public
```

#### Build the API-provided client module

The ESM module served at `/api/v1/client-module` is bundled from
`packages/client/src/index.ts` during deployment (via `postbuild`). Build it
locally with:

```bash
pnpm build-client-module
# → esbuild packages/client/src/index.ts ... --outfile=.vercel/output/static/client-module.js
```

## User image handling

Images for white-label sites (logo, app icons) are stored on Cloudflare R2, the
same S3-compatible bucket used for secret files (`PUBLIC_S3_ENDPOINT`).

## White-label with HTTPS (local)

To test the white-label multi-tenant setup locally you need HTTPS with a custom domain.

1. Install [mkcert](https://github.com/FiloSottile/mkcert) and set up a local CA:

```bash
brew install mkcert
mkcert -install
```

2. Generate certificates for your white-label domain and localhost:

```bash
mkcert wl.encoded.org localhost 127.0.0.1 ::1
```

This creates `wl.encoded.org.pem` and `wl.encoded.org-key.pem` in the current directory.

3. Add the domain to `/etc/hosts`:

```
127.0.0.1 wl.encoded.org
```

4. The `vite.config.ts` automatically picks up the certificates if they exist. No config changes needed — HTTPS is enabled conditionally when `.pem` files are present.

> **Note:** The `.pem` files are gitignored and must be generated per machine.

## Limits & abuse controls

File uploads (the only path that writes to R2) are gated at
`POST /api/v1/secrets/files`:

- **1 GB** per file, **65 MB** per chunk (the latter enforced by a signed
  `Content-Length` on the presigned PUT).
- Per-IP rate limit on presigned-URL minting.
- A global rolling **24 h upload budget** (`DAILY_UPLOAD_BUDGET_BYTES`, default
  5 GB) — a hard ceiling on total ingestion regardless of IP.
- The daily cron emails an alert when total bucket storage exceeds
  `R2_STORAGE_ALERT_THRESHOLD_BYTES`. Files are deleted after
  `FILE_RETENTION_PERIOD_IN_DAYS` (30).

Thresholds live in `src/lib/constants.ts`.

## Error Handling

We use SvelteKit recommendation: https://svelte.dev/docs/kit/errors
Expected errors are returned with `error(404, 'Some message')` and might be shown to users. For internal errors (mostly unexpected) we use `throw new Error()`.

## Stack

- SvelteKit
- Tailwind CSS
- PostgreSQL (Database)
- Drizzle (ORM)
- Inlang/Paraglide (i18n)
- Lettermint (Email)
- Cloudflare R2 (Object storage)

## Infrastructure

- Website on [Vercel](https://vercel.com)
- PostgreSQL on [Neon](https://neon.tech)
- Object storage on [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible)
- Email via [Lettermint](https://lettermint.co)

## License

[MIT](https://opensource.org/license/mit/) (Code)

[CC BY-NC-ND](https://creativecommons.org/licenses/by-nc-nd/4.0/) (Creatives)
