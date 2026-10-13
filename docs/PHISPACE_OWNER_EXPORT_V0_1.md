# PhiSpace owner-curated export v0.1

## Objective

Prove the **owner-directed local publishing preparation** step without
reading Infinite Porch private state, requiring a network connection, or
pretending that a public JSON field authenticates consent or identity.

PR #4 implemented a **read-only example doorway**. This follow-up creates
a separate **offline export CLI** so someone can compose visitor-facing text
by hand and approve the exact bytes that leave the draft stage.

No automatic uploading, publishing, sync, file scanning, Porch daemon calls,
account identity, cryptographic signatures, or browser ingestion is added.

## Two-step operator flow

Use Python 3.12+ and install the repository locally:

```powershell
py -3.12 -m pip install -e .
```

Copy the [fictional sample draft](../tests/fixtures/phispace/manual_public_draft.json)
to your own working folder and edit the fields you explicitly wish to share.
Never use a real private Porch export as a starting point.

**1. Preview and read every field:**

```powershell
py -3.12 -m infinite_commons.phispace_publisher preview --draft "C:\CommonsDrafts\my-public.json"
```

This prints the complete *proposed public artifact* and a SHA-256 content
digest. **Nothing is written or posted** by the preview command.

**2. Only after reviewing, create a local export file:**

```powershell
py -3.12 -m infinite_commons.phispace_publisher export --draft "C:\CommonsDrafts\my-public.json" --out "C:\CommonsExports\my-public.json" --approve-sha256 REPLACE_WITH_THE_64_CHARACTER_PREVIEW_HASH --confirm-public
```

The destination's parent folder must already exist. The output file must
**not** exist; the tool refuses overwrites. The file is created locally
with restrictive permissions where supported. The command will never
automatically stage a Git commit or upload to a website.

If the draft changes in any way that affects the proposed export, the
content digest changes and approval fails. Preview again before exporting.

The digest protects against **accidental draft changes between preview and
export**, not impersonation or dishonest publishers. It is not a digital
signature, authentication token, copyright declaration, or proof of consent.

## Draft format

Use only these exact fields:

```json
{
  "schema": "commons.phispace.draft.v0.1",
  "space_id": "phispace.lantern-room",
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
      "body": "Visitor-facing sample text only."
    }
  ]
}
```

Only manual text is supported. Unexpected structured fields (including file
paths, credential fields, extra section metadata, and executable types),
duplicate JSON keys, control characters and unsafe IDs are rejected.
**Freeform visitor text is not secret-scanned:** an operator can still type a
private fact, URL or path inside an allowed text field, so the full preview
must be carefully inspected before approval. One to six sections may be selected from
`about`, `music`, `gallery`, `projects`, and `guestbook`.

The export adds:

- `schema: commons.phispace.public.v0.1`
- `publication_mode: owner-curated-export`
- `visibility: public`

These describe the operator's requested **offline public artifact**, not a
verified public identity or actual network availability. The exported text
must be reviewed to avoid accidentally including personal or secret content.
Validation cannot detect every confidential fact someone types into a public
text field.

## Boundary with the Commons demo

The browser demo in `web/` still accepts **only** its bundled
`example-fixture` manifest and the fixed `phispace.example` doorway.

It does **not** accept `owner-curated-export` files, dynamically fetch a
PhiSpace from a local PC, or automatically publish this artifact. That
intentional boundary remains until a separate governance and verification
milestone designs publication provenance, owner authentication, revocation,
expiration and consumer acceptance.

Do not circumvent the boundary by renaming or altering the publication mode
and dropping a personal manifest into the public `web/fixtures` directory.
Doing that could publish information through a static website without
adequate authentication or revocation.

## Verification

```sh
pytest tests/test_phispace_publisher.py
pytest
ruff check .
node --test web/tests/*.test.mjs
```

The existing CI already runs Python and browser tests. Added tests cover
preview-only behavior, mandatory explicit confirmation, changed-draft SHA
mismatch, create-only export, schema allowlists, duplicate JSON fields,
oversized content, directories/symlinks, and blocked output paths.

## Anti-M completion gate

- [ ] Tests green on the PR commit.
- [ ] Manual PowerShell preview/export walkthrough.
- [ ] Confirm no private path/data scanning or network requests.
- [ ] Verify absence of browser integration and automatic publishing.
- [ ] Human-review the resulting local JSON before any downstream sharing.

**Future PR:** define a real opt-in publication handoff with revocation and
publisher-authenticated provenance, then update the Commons viewer to verify
and consume only approved public artifacts.
