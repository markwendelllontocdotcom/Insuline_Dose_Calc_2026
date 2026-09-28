# Insulin Dose Calculator

A small iPhone web app that follows the *Flexible Insulin Dose Plan 2026* and works out the dose the same way as the Excel calculator.
Everything runs on the phone: no accounts, no tracking, nothing saved or sent anywhere.
After the first visit it works offline.

**Helper tool only – always check against the written plan and follow the care team’s advice.**

## Files

| File | What it is |
|---|---|
| `index.html` | The screens (Calculator, Plan, Instructions) |
| `style.css` | Look and layout (one screen, no scrolling) |
| `app.js` | The dose plan numbers (`DOSE_PLAN` at the top) and all calculations |
| `manifest.json` | Name and icon for the Home Screen |
| `service-worker.js` | Keeps a copy of the app on the phone so it works offline |
| `icons/` | App icons |
| `tests/calc.test.js` | Automated tests (not needed on the phone) |

## Put it online for free (GitHub Pages)

Do this on a computer – it is much easier than on a phone.

1. Create a free account at <https://github.com> and sign in.
2. Click **+** (top right) → **New repository**. Name it, for example, `dose-calc`.
   Leave it **Public** (free GitHub Pages only works with public repositories).
   Turn on **Add README** then click **Create repository**.
3. Unzip `insulin-dose-calculator.zip` on your computer.
4. In the new repository click **Add file** → **Upload files**. Drag in everything from inside the unzipped
   folder: `index.html`, `style.css`, `app.js`, `manifest.json`, `service-worker.js` and the
   `icons` folder (the `tests` folder is optional). Click **Commit changes**.
   The files must sit at the top level of the repository, not inside another folder.
5. Open **Settings** → **Pages** (left side, under “Code and automation”).
   Under **Build and deployment** → **Source** choose **Deploy from a branch**.
   Choose branch **main** and folder **/ (root)** then click **Save**.
6. Wait a few minutes (GitHub says up to 10). Refresh the Pages settings: the address appears at the top,
   for example `https://YOUR-USERNAME.github.io/dose-calc/`.

Because the repository is public, anyone who finds it can see the plan numbers.
The files contain no name or other personal details.

## Add it to the iPhone Home Screen

1. Open the address in **Safari** while online. Let it load fully (this stores the offline copy).
2. Tap the **Share** button. On iOS 26 and newer it is inside the **•••** menu next to the address bar
   (tap **•••** → **Share**). On older iOS it is the square with an arrow in the toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. Keep **Open as Web App** switched on. Keep the name “Insulin Dose” (or change it) then tap **Add**.
5. Open it once from the Home Screen while online. To check offline use: turn on Airplane Mode,
   open the app and type a reading.

## Using it

- The meal time is picked from the phone’s clock (05:00–10:59 Breakfast, 11:00–15:59 Lunch,
  16:00–20:59 Dinner, otherwise Bedtime). Tap a snack when it is snack time.
- A food row only counts when it has both a name and carbs. An orange dashed box shows which part is missing.
- While the keypad is open the iPhone may slide the screen up. If that hides the Total, the reading or the
  message, a strip at the top shows all three.
- Tap **Clear** before the next reading. The app also clears itself after 30 minutes in the background
  so an old reading is never shown as if it were new.

## Changing the plan later

1. On GitHub open `app.js`, click the pencil icon and change the numbers in `DOSE_PLAN`
   (and `planTitle` if the plan has a new name or year). Click **Commit changes**.
2. Open `service-worker.js` the same way and change `CACHE_VERSION` from `v1` to `v2` (then `v3` next time …).
   Commit. Without this step phones keep the old version.
3. On the iPhone open the app while online. It updates itself when nothing has been typed yet;
   otherwise a blue bar says “A new version is ready – tap here to reload”.
4. Check the **Plan** tab shows the new numbers. The **Instructions** tab shows which offline copy is in use (v1, v2 …).

## Running the tests (optional, needs Node.js 18 or newer)

```
node --test
```

Run it from this folder. The tests cover the required cases, every correction band boundary in every column,
the arrows, the rounding, the colours, the messages and the clock-based meal time.
