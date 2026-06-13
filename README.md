# Mecanik API (TypeScript/JavaScript)

Official TypeScript/JavaScript client for the [Mecanik API](https://mecanik.dev/en/api/): AI, security analysis, email, reports and developer utility endpoints. Pay-per-use credits, no subscription.

**New accounts get 100 free credits.** Grab your account UUID and an API token at [members.mecanik.dev](https://members.mecanik.dev). Full reference: [api.mecanik.dev/docs](https://api.mecanik.dev/docs).

## Install

```bash
npm install @mecanik-dev/api
```

## Quick start

```ts
import { MecanikClient } from '@mecanik-dev/api';

const mecanik = new MecanikClient({
  accountId: 'YOUR_ACCOUNT_UUID',
  token: 'YOUR_API_TOKEN',
});

// Each tool returns just the `result`, and throws MecanikError on failure.
const headers = await mecanik.tools.securityHeaders({ url: 'https://example.com' });
console.log(headers.grade, headers.score);

const tokens = await mecanik.tools.tokenCounter({ text: 'Hello world', models: ['gpt-4o', 'claude-sonnet-4-6'] });
const audit = await mecanik.tools.websiteAudit({ url: 'https://example.com' });
const balance = await mecanik.credits(); // { credits: number }
```

## Error handling

```ts
import { MecanikError } from '@mecanik-dev/api';

try {
  await mecanik.tools.dnsLookup({ domain: 'example.com' });
} catch (err) {
  if (err instanceof MecanikError) {
    console.error(err.status, err.message, err.errors);
    // status 402 → out of credits; 403 → bad token; 429 → rate limited
  }
}
```

## Lower-level access

```ts
// Full envelope { result, success, errors }
const res = await mecanik.raw('/tools/dns-lookup', { domain: 'example.com' });

// Any endpoint by path
const result = await mecanik.call('/tools/hash-generate', { input: 'hello', algorithm: 'sha256' });
```

## Available tools

`mecanik.tools.*` provides one method per endpoint:

- **AI:** `aiCodeReview`, `aiContentSummarize`, `aiSeoGenerate`, `aiTranslate`, `aiChat`, `aiImageGenerate`, `aiExtract`, `aiAltText`, `aiModeration`
- **Security:** `securityHeaders`, `tlsCheck`, `techDetect`, `seoAnalyze`, `dnsLookup`, `openapiValidate`, `subdomainFinder`, `exposedFiles`
- **Email:** `emailDeliverability`, `emailValidator`, `emailValidatorBulk`
- **Reports:** `websiteAudit`, `performanceAudit`, `brokenLinkChecker`, `carbonFootprint`
- **Utilities:** `qrGenerate`, `placeholderImage`, `hashGenerate`, `jwtDecode`, `passwordStrength`, `cronExplain`, `tokenCounter`, `jsonToCode`

Account helpers: `account()`, `tokenInfo()`, `credits()`, `listTools()`.

See [api.mecanik.dev/docs](https://api.mecanik.dev/docs) for each endpoint's request body and response shape, or import the machine-readable spec from [api.mecanik.dev/openapi.json](https://api.mecanik.dev/openapi.json).

## License

MIT
