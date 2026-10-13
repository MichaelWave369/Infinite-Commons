# Infinite Commons React Pages v0.1

## What it is

The existing deterministic Python Infinite Commons CLI and the first vanilla
browser prototype (PRs #3-6) are preserved.

This contribution adds a genuine **React 19 + Vite 7** browser experience in
`apps/commons-react/` and a GitHub Actions pipeline to build and serve it on
**GitHub Pages** after review and merge.

Expected project Pages address:

```
https://michaelwave369.github.io/Infinite-Commons/
```

That URL is the deployment **target**, not proof that publishing has completed.
See the successful `Deploy Infinite Commons React Pages` workflow receipt for
the actual deployment state.

## What visitors can do

- Explore the original Midnight Sierra terrace illustration with clickable
  fictional PhiSpace, sample BBS, and sample Commons doorways.
- Switch between **20 curated data-only aesthetic presets**, including the two
  distinct scene designs (Midnight Sierra, Cloudgarden) and eighteen palette
  previews.
- Keep the selected style locally in browser localStorage.
- Choose their own **manually exported owner-curated PhiSpace JSON** using the
  browser's file chooser. Preview only strict public-facing text in the
  same-tab Commons experience, then withdraw the preview from the tab.
- Use mouse, touch or keyboard for buttons and modal interactions; reduced
  motion preferences are respected.

The React application imports the **existing repository-owned** theme
catalog, schema validation, local preview controller and SVG illustration.
It does not fork the trust model, replace the Python bootstrap, or require
remote image assets. Public home example text is bundled from the approved
fictional fixture; no arbitrary network fetches or private-directory scans
are made by this application.

## Run locally

Node.js 22+ recommended:

```sh
cd apps/commons-react
npm install
npm run dev
```

Open the localhost address Vite prints, usually `http://127.0.0.1:5173/`.

Build for the GitHub Pages project subpath:

```sh
COMMONS_BASE_PATH=/Infinite-Commons/ npm run build
```

Windows PowerShell:

```powershell
$env:COMMONS_BASE_PATH="/Infinite-Commons/"
npm run build
```

Build artifacts are `apps/commons-react/dist/`, which must not be committed.

## Deploy

`.github/workflows/deploy-commons-pages.yml` runs on a push to `main`
or a manual workflow dispatch. It installs the React dependencies, runs the
shared contract tests, builds under `/Infinite-Commons/`, validates generated
asset paths, and publishes only the `dist/` folder as a Pages artifact.

To allow deployments, the GitHub repository's
**Settings → Pages → Build and deployment → Source**
must be **GitHub Actions**. Enabling this is an owner-controlled repository
setting; adding the workflow alone does not guarantee deployment if the Pages
source is configured differently or policies block the environment.

If deployment doesn't run after merging, use
**Actions → Deploy Infinite Commons React Pages → Run workflow**, and inspect
the workflow logs. A green CI build is not the same as a green Pages deployment.

## Verification

From the repository root:

```sh
node --test web/tests/*.test.mjs
node --test apps/commons-react/tests/*.test.mjs
ruff check .
pytest
```

CI additionally installs packages and performs a real production React build.

The release is complete only after the Pages deploy is green and somebody
checks the live page on desktop and mobile, selects a different style, opens
each hotspot, previews a local approved JSON artifact, withdraws it, then
reloads to confirm that the selected private preview is gone.

## Intentional limitations

This is a **public static demo**, not a federated hosted Commons, multiplayer
service, authenticated PhiSpace registry, actual BBS, live Porch networking,
or VR/WebXR experience. The preview remains in browser memory, and the
illustrative PhiSpace is fictional. No real visitor data is published.

Withdrawal of a local preview does **not** revoke content previously posted
or copied elsewhere. Real publication needs a separate owner-authenticated,
revocable protocol, audited identity boundary and freshness rules. Style packs
do not grant access to those systems.

### Dependency note

React/React DOM 19.2.0 and Vite 7.1.12 are exact direct dependency versions.
The build uses `npm install` rather than `npm ci` until an audited,
committed lockfile is generated in an online build environment; a later
hardening milestone should commit the resolved lockfile and switch to
`npm ci`.

The core Python CLI, `web/` prototype, and their test suites remain intact.
