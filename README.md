# Depth: defence in depth, made visible

A static, vendor-neutral learning site for security architecture. There is no
build step, backend, API key or environment variable. Publish the repository root with `index.html` as the default document, over HTTPS.

## What is in the repo

    index.html      Page structure and copy
    style.css       Night blueprint palette, layout, responsive rules
    app.js          Control and journey content, diagram, interactions, checklist export
    favicon.svg     Site icon
    _headers        Security headers for Netlify and Cloudflare Pages (ignored elsewhere)
    fonts/          IBM Plex Sans and Mono, latin subset, plus the OFL licence

## Editing content

- Page copy and sections: `index.html`.
- Colours and type: the custom properties at the top of `style.css`.
  Each accent has one meaning; keep it that way or the diagram key stops
  being true.
- Architecture text: `controls` and `environments` in `app.js`.
- Overview components and journeys: `overviewNodes` and `scenarios` in
  `app.js`. Each journey has an `off` entry per component on its path,
  which is the outcome shown when that component is switched off.

## Security notes

- The Content Security Policy is a meta tag in `index.html`, so it applies on
  any host. It only works because no markup uses `style=""` or inline
  handlers; keep it that way or add hashes to the policy.
- `frame-ancestors` cannot be set from a meta tag. It is in `_headers` for
  hosts that read that file; on any other host, set it as a response header.
- No analytics, cookies, storage or network calls. The checklist is built in
  the browser and downloaded as a Blob.

## Local preview

    python3 -m http.server 8080

## Checks run before release

Headless Chromium at 1440, 1024 and 390 px wide: no console errors or CSP
violations, no third-party requests, fonts load locally, no horizontal
overflow, smallest visible text 12px, journey and control outcomes match the
switched-off component, the checklist downloads under the CSP with UTF-8
intact, and all eight overview components are exposed as buttons.

Not checked: Safari and Firefox rendering, and screen reader output on a real
device. Worth one pass with VoiceOver before announcing it.

## References

- NIST SP 800-207, Zero Trust Architecture: https://www.nist.gov/publications/zero-trust-architecture
- NCSC cloud security principles: https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles
