# Start Odds Lab

1. Extract the ZIP.
2. Open a terminal in the `odds-lab` folder (the folder containing `package.json`).
3. Install Node.js 20 or newer if needed.
4. Run `npm test`, then `npm start`.
5. Open `http://localhost:3000`.

## Pages

- Main page: five random probability simulations and a large-sample experiment.
- `/workflows.html`: the ten-stage fictional site journey, bonus calculator, mock withdrawal, source notes and printable awareness guide.
- `/control.html`: a real Node backend for a disclosed teaching demonstration. Choose random, always win, always lose, or a W/L sequence, create a session, then observe outcomes. The audit compares the original random sample with the presented result. Export it before deleting the session or reloading.

This is an educational simulator, not a real-money gambling service. Forced outcomes are always labelled. No real deposit or withdrawal is possible.

## Copy into your existing repository without rewriting history

From your existing local `mines` checkout, pull the latest changes first and ensure you have saved any local edits. Create a branch:

```sh
git switch -c odds-lab-awareness
```

Copy the extracted folder's contents into the checkout root (alongside its existing `.git` folder); do not copy a nested `odds-lab` directory as the application root. The ZIP does not contain Git history. Review the resulting changes, then:

```sh
npm test
git status
git add README.md SECURITY.md START-HERE.md package.json package-lock.json server.js demo-backend.js public test
git commit -m "Build gambling-awareness workflows and disclosed backend demo"
git push -u origin odds-lab-awareness
```

Open a pull request to review and merge. Do not force-push or delete your existing history. If any command fails, stop and resolve that error before running the later commands.

## Hosting

Use a Node-capable host with start command `npm start`; the server reads `PORT`. There is no build step and there are no third-party runtime dependencies. Read SECURITY.md before public hosting.

Static-only hosting of `public/` supports the probability lab and workflow guide, but cannot execute the backend demonstration. The control page explains this if API requests fail. Hosting this on a public URL has not been performed by this package.
