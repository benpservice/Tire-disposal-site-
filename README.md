# Tire Disposal & Distribution — Site + Dashboard

This is your full website plus a private dashboard where you can see and manage
pickup requests as they come in, and an email notification sent to your inbox
for every new request.

## What's in here

- `public/` — the website itself (Home, Services, About, Contact, Book a Pickup)
  plus `login.html` and `dashboard.html`, which are not linked from the main
  menu (there's a small "Owner Login" link in the footer of every page)
- `server.js` — the backend that saves pickup requests and serves the site
- `data/pickups.json` — where pickup requests are stored
- `.env.example` — a template for the settings you need to fill in

## 1. Set your password and email settings

Copy `.env.example` to a new file called `.env` and fill in:

- `ADMIN_PASSWORD` — whatever password you want to use to log into the dashboard
- `SESSION_SECRET` — any random string of letters/numbers, just mash the keyboard
- `EMAIL_USER` — your Gmail address (usatiredisposalandistribution@gmail.com)
- `EMAIL_PASS` — a **Gmail App Password**, not your normal Gmail password (see below)
- `NOTIFY_EMAIL` — the address that should receive new-request emails (can be the same Gmail address)

### Getting a Gmail App Password

Gmail won't let outside apps send mail using your normal password. You need a
separate 16-character "app password":

1. Go to your Google Account → **Security**
2. Turn on **2-Step Verification** if it isn't on already (required for app passwords)
3. Search for **App Passwords** in the account settings search bar
4. Create one, name it something like "Tire Site"
5. Google gives you a 16-character code — paste that into `EMAIL_PASS`

If you skip this step, the site still works and requests still land in the
dashboard — you just won't get an email notification.

## 2. Deploy to Railway (free to start)

1. Put this project in a GitHub repository (Railway can also deploy via their
   CLI if you'd rather not use GitHub — ask and I can walk through that path)
2. Go to [railway.app](https://railway.app) and sign up
3. **New Project → Deploy from GitHub repo** and pick this repo
4. Once it's created, go to your project's **Variables** tab and add the same
   values from your `.env` file (`ADMIN_PASSWORD`, `SESSION_SECRET`,
   `EMAIL_USER`, `EMAIL_PASS`, `NOTIFY_EMAIL`) — do **not** upload the `.env`
   file itself
5. Railway will install everything and start the site automatically
6. Under **Settings → Networking**, click **Generate Domain** to get your
   public web address

That's it — visiting that address shows your site, `/login.html` is where you
log in, and `/dashboard.html` is where pickup requests show up.

### A note on data persistence

Requests are stored in a file (`data/pickups.json`) on Railway's server. This
persists while your app is running, but a fresh deploy can reset it unless you
attach a **Volume** (Railway → your service → Settings → Volumes → mount at
`/app/data`). Once you're getting real volume, it's worth adding a volume — or
later moving to a proper database — so nothing gets lost on redeploy.

## 3. Using the dashboard

- Go to `/login.html`, enter your password
- New requests show up under **New**
- Move a request to **Scheduled** once you've booked a pickup window, then
  **Completed** once it's done — use the dropdown next to each request
- **Delete** removes a request permanently
