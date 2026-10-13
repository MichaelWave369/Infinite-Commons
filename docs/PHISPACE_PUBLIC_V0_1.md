# PhiSpace Public Manifest v0.1: Read-only demonstration boundary

This PR is a **separate, optional browser experience milestone** for Infinite
Commons. It does not alter the Python bootstrap loader, the Porch networking
protocol, PhiOS, PhiPie, storage grants, or anybody's private computer.

## What it proves

The clickable **PhiSpace** doorway on the Commons arrival terrace can load a
small **curated, fictional public-home manifest** from a fixed local website
path, validate the complete structure, and render a public-home card with
plain text.

The fixture is included at:

`web/fixtures/phispace-public.json`

The module implementing this narrow seam is:

`web/phispace-public.mjs`

Example contract:

```json
{
  "schema": "commons.phispace.public.v0.1",
  "space_id": "phispace.example",
  "visibility": "public",
  "publication_mode": "example-fixture",
  "profile": {
    "display_name": "The Lantern Room",
    "tagline": "A little music and mystery.",
    "welcome": "This is a fictional public home."
  },
  "sections": [
    {
      "id": "about",
      "kind": "about",
      "title": "The Front Room",
      "body": "Sample visitor-facing text only."
    }
  ]
}
```

### Strict allowlist

- Exactly six top-level properties; unrecognized properties fail.
- Profile fields: `display_name`, `tagline`, `welcome` only.
- Sections: 1 to 6 entries with `id`, `kind`, `title`, and `body` only.
- Supported section kinds: `about`, `music`, `gallery`, `projects`, `guestbook`.
- Limited text size; control characters and Unicode bidi overrides rejected.
- Whole JSON limited to 16 KiB.
- Duplicate/unsafe section IDs fail. Schema, visibility and publication mode
  must exactly match the expected **public demonstration** values.
- The fixture must identify `phispace.example`, a predefined non-personal
  example destination. An unexpected ID fails.
- The browser requests only the hardcoded `./fixtures/phispace-public.json`
  URL using `mode: same-origin`, `credentials: omit`, `redirect: error`.
- No HTML interpretation, Markdown parsing, images, remote media, scripts,
  URLs, file paths, IP addresses, grants or executable extensions.
- Invalid or absent data produces a closed-door message. There is **no
  fallback** to local disks, a live Porch daemon or private APIs.

The demo displays manifest text using DOM `textContent`. No `innerHTML` or
arbitrary link construction is performed.

## Important authority distinction

A JSON string `"visibility": "public"` **does not prove consent**.
A public document can claim anything. The v0.1 schema is a presentation
validation boundary, not a trust anchor, signature verifier or ACL engine.

**Real publishing is not enabled.** Before integrating Infinite Porch:

1. Define a local, opt-in export flow owned by the Porch operator.
2. Only copy explicitly selected public fields into a separate, revocable
   publication artifact; never expose the source directories or private vault.
3. Authenticate publisher provenance and verify intended audience at the
   authoritative transport layer, not from manifest claims alone.
4. Define revocation / cache expiry and distinguish signed provenance
   from independently verified truth.
5. Prevent a style/theme pack from selecting a resource origin or escalating
   its permissions. Aesthetic layers remain data-only.
6. Test malicious and missing manifests, stale publication, nonlocal URLs,
   changed identities, and revoked sharing before any live integration.

Do not connect arbitrary local hostnames, accept cross-origin URLs,
or silently fetch from `127.0.0.1:7331` when a public manifest is missing.

## Verification

From the repository root, with Node 22+:

```bash
node --test web/tests/*.test.mjs
```

All existing Python CI gates remain in place. The tests cover:

- Valid fixture parsing and immutable, detached model.
- Rejection of private visibility, wrong schema, unknown fields,
  duplicate IDs, unknown types, unsafe IDs, bidi controls and oversized text.
- Fixed same-origin, unauthenticated, redirect-rejecting request.
- Closed failure on missing fixture and wrong destination identity.
- Invariance of the visual world/node contract from PR #3.

## User-facing expectations

Open the existing browser demo and click the **PHISPACE** hotspot.
It now displays the published sample **The Lantern Room**. Missing or invalid
JSON yields **The doorway stays closed**. Theme switching continues to work
without changing `phispace.example` or any other world node.

The sample music shelf and guestbook describe potential content, **not**
functioning music streaming, posting, personal accounts, multiplayer,
remote collaboration or WebXR.

## Completion contract

A mergeable candidate requires:

- [ ] Browser Node tests green, alongside existing Python checks.
- [ ] Human walkthrough of PhiSpace drawer/panel, theme switching and failure UX.
- [ ] No private Porch integration or hidden network calls.
- [ ] Explicit demo/authority disclaimers remain accurate.

Next milestone: real *publisher-side* opt-in export semantics, public artifact
provenance and explicit approval in a separate reviewable PR. VR comes after
the semantic world and permission boundaries are reliable.
