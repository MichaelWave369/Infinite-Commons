# PhiSpace Local Preview + Withdraw v0.1

## Purpose

Link two already-delivered components in a **safe, local demonstration**:

- PR #5: an explicitly reviewed, owner-curated, **offline JSON export**.
- PR #4: a strictly validated, text-only, example PhiSpace doorway.

This PR lets a person **choose their own exported JSON file** in the
browser, view its plain-text profile/sections through the existing Commons
doorway, and **withdraw** that preview immediately.

It is **not** a public listing, a publication endpoint, a real identity
credential, a Porch connection, or a distributed revocation protocol.

## Run

From the repository root:

```sh
python -m http.server 8000 --directory web
```

Visit `http://127.0.0.1:8000/`.

Use the #5 workflow to create a new `owner-curated-export` JSON artifact:

```powershell
py -3.12 -m infinite_commons.phispace_publisher preview --draft "C:\CommonsDrafts\my-public.json"
py -3.12 -m infinite_commons.phispace_publisher export --draft "C:\CommonsDrafts\my-public.json" --out "C:\CommonsExports\my-public.json" --approve-sha256 COPY_THE_REVIEW_HASH --confirm-public
```

In the Commons arrival view:

1. Press **Preview a local PhiSpace JSON**.
2. Pick the newly exported file explicitly through your operating system's
   file chooser.
3. See the public profile as the **Unverified Local Preview**.
4. Change the visual style. This doesn't change the public text or any
   semantic Commons location.
5. Press **Withdraw local preview**. The current in-memory preview disappears,
   any pending asynchronous import is cancelled by a generation check, and
   the next click on the PhiSpace door returns to the fictional sample.

Importing a file never uploads it, reads your Porch, accesses localhost
services, or writes to a registry. It does not alter the source file.
Refresh or close the tab to clear the preview.

## Strict but limited safety model

- Only a file explicitly selected by a user is read with `File.arrayBuffer()`.
- No arbitrary URL, network host, directory scanning, or filesystem path
  from a manifest is followed.
- Files must be at most 16 KiB and valid UTF-8 JSON.
- Exact allowlist: same six fields, profile shape and section types as the
  v0.1 read-only demo; `publication_mode` must be
  `owner-curated-export`. Unlike the fixture reader, a locally previewed
  `phispace.*` ID may identify the author's draft.
- DOM panels use text-only `textContent`, never HTML.
- Only one preview resides in this JavaScript module's memory. No
  localStorage, IndexedDB, cookies, cloud sync, requests, or persistent
  directory entries are made by this new feature.
- Clearing the preview invalidates slow outstanding reads. Invalid
  selections fail closed and clear the previous preview.
- Existing static sample `example-fixture` handling remains unchanged.
- A selected file claiming `"visibility": "public"` is **not proof** that
  its author owns an identity, controls a Porch, or consented to publication.
  The entire local preview is labeled **UNVERIFIED**.

### What withdrawal actually means

**Withdraw only removes the file from this browser session.**

It cannot revoke files previously emailed, downloaded, indexed by a search
engine, hosted elsewhere, or copied by another user. It does not remove
records from any network or contact another node.

Actual distributed publication requires **issuer-authenticated provenance,
approval, a controlled publication endpoint, defined freshness/expiry,
revocation checks, and consumer enforcement**. A static GitHub Pages demo
cannot guarantee deletion of copies that have escaped the owner's control.

## Tests and review

```sh
node --test web/tests/*.test.mjs
ruff check .
pytest
```

The new suite verifies both successful local preview and blocked invalid
fields, oversized/bad UTF-8, unsupported publication modes, non-persistent
session state, withdrawal during slow reads, and invalid-next-file behavior.

Anti-M review criteria:

- [ ] Head SHA CI green, including existing Python contracts.
- [ ] Manually export the fictional test draft with #5 and preview it.
- [ ] Confirm clicking **Withdraw** removes it and sample doorway returns.
- [ ] Verify no network calls except the original fixed-site demo fixture.
- [ ] Inspect keyboard operation and responsive layout.
- [ ] No real hosting, authentication, or revocation claims.

## Subsequent milestone

Design a **separate, approved distribution protocol** with authenticated
publisher control, expiry and enforceable revocation checks before exposing
other people's real PhiSpaces. Avoid storing or broadcasting data from
private Infinite Porch directories without explicit scope and verification.
