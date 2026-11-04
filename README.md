# FitTrack

A clean, responsive fitness and activity tracker built with **HTML, CSS and vanilla JavaScript**.

## Features

- Simple dashboard with daily activity summaries.
- Weekly activity graph showing active minutes across the last seven days.
- Visual progress bars for optional, user-configurable step and active-minute targets.
- Manual activity logging: walking, running, cycling, yoga, gym/strength training, swimming, dance, sports and other.
- Records date, duration, steps, optional calorie estimate and notes.
- Activity history with delete controls.
- Export activity data as a JSON backup.
- Responsive layout for desktop, tablet and mobile.

## Project files

- `index.html` — page structure and screens.
- `style.css` — layout, colors, responsive styling and progress visuals.
- `script.js` — logging, charts, summaries and browser storage.

## Run the project

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Add an activity. It will appear on the dashboard and history page.

No build tools or package installation are needed.

## Storage: localStorage

This version saves activity records and preferences in the browser using `localStorage`. This is a lightweight browser key-value store; **it is not SQLite**.

- Data remains in the same browser on the same device.
- It does not create user accounts or sync records between devices.
- Clearing browser site data can remove saved entries.
- Use **Activity history → Export data** to download a JSON backup.

## Publish on GitHub Pages

1. Create a GitHub repository, for example `fittrack`.
2. Upload `index.html`, `style.css`, `script.js` and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site. The public URL appears in the Pages settings.

## Want Firebase or SQLite?

For multi-user login, cloud backups and cross-device sync, connect a backend such as Firebase (Authentication + Firestore). SQLite is usually used behind a server or in a local app, not directly by a static GitHub Pages website. This project intentionally stays backend-free so it can be uploaded and run immediately.

## Health and privacy note

Calorie values are optional estimates entered by the user, not medical measurements. Targets are editable personal preferences, not health requirements. FitTrack is a record-keeping tool and does not provide medical advice.
