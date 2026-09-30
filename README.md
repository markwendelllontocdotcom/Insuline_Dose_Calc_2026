# Insulin Dose Calculator

A small iPhone web app that follows the *Flexible Insulin Dose Plan 2026* and works out the dose the same way as the Excel calculator.
The calculator runs on the phone: no accounts, no tracking, nothing saved or sent anywhere.
(The optional Libre Shortcut below signs in to LibreLinkUp to fetch the latest reading.)
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
  16:00–20:59 Dinner, otherwise Bedtime). Tap another meal time to change it.
- The message (for example “Above 180 …”) sits right under the yellow Total.
- A food row only counts when it has both a name and carbs. An orange dashed box shows which part is missing.
- While the keypad is open the iPhone may slide the screen up. If that hides the Total, the reading or the
  message, a strip at the top shows all three.
- Tap **Clear** before the next reading. The app also clears itself after 30 minutes in the background
  so an old reading is never shown as if it were new.

## Libre Shortcut (optional): open the calculator with the latest Libre reading

An iPhone Shortcut on the child's phone signs in to **LibreLinkUp** (Abbott's caregiver service), gets the latest
reading and opens the calculator. A box shows the reading and when it was taken; nothing is used until
**Use this reading** is tapped. Readings older than 10 minutes, LO and HI are refused, and a used reading is
removed from the calculator once it is more than 10 minutes old. The Libre arrow is shown, but the arrow in the
calculator is still tapped by hand, as the care plan says.

This uses LibreLinkUp in an unofficial way. It can stop working whenever Abbott changes LibreLinkUp, and it needs
internet when it runs. LibreLinkUp can be a few minutes behind the Libre app. If it stops working, open the
calculator from its own icon and type the reading as before.

### 1. Before you start

1. You need a LibreLinkUp account that follows **only this child** (the Shortcut takes the first person the
   account follows, so an account that also follows someone else could show the wrong person's reading).
   Making a new LibreLinkUp account just for this is best: it also keeps your main password off the child's phone.
   In the child's **Libre** app: **Menu** → **Connected Apps** → **LibreLinkUp** → **Add Connection**, then enter
   that account's email. Accept the invitation in the **LibreLinkUp** app.
2. Sign in to the LibreLinkUp app once with that account and accept any terms it shows. Check it shows the child's reading.
3. The steps below use the UAE server `api-ae.libreview.io`. If your LibreLinkUp account was made for another
   country, see "If it does not work".

### 2. Build the Shortcut (on the child's iPhone)

Open **Shortcuts** → tap **+**. Tap the name at the top and call it **Libre Dose**. Add these actions in this order
(search for each one in the search bar at the bottom). Type everything exactly as shown.

1. **Get Contents of URL**
   - URL: `https://api-ae.libreview.io/llu/auth/login`
   - Tap **›** to show more. **Method**: `POST`
   - **Headers** → **Add new header** twice: `product` = `llu.ios` and `version` = `4.16.0`
   - **Request Body**: `JSON` → **Add new field** → **Text** twice: `email` = the LibreLinkUp email and
     `password` = the LibreLinkUp password
2. **Get Dictionary Value** – Get **Value** for key `data.authTicket.token` in **Contents of URL**
3. **Set Variable** – name `Token`
4. **Get Dictionary Value** – key `data.user.id`. Tap the blue input after "in" → **Select Variable** →
   tap **Contents of URL** under action 1.
5. **Generate Hash** – tap the type and choose **SHA256**
6. **Change Case** – **lowercase**
7. **Set Variable** – name `AccountID`
8. **Get Contents of URL**
   - URL: replace whatever is in the URL field with `https://api-ae.libreview.io/llu/connections`
   - **Method**: `GET`
   - **Headers** → four headers: `product` = `llu.ios`, `version` = `4.16.0`,
     `Authorization` = `Bearer ` (with a space after it) followed by the **Token** variable
     (tap **Variables** above the keyboard), and `account-id` = the **AccountID** variable
9. **Get Dictionary Value** – key `data` (in the Contents of URL from action 8)
10. **Get Item from List** – **First Item**
11. **Get Dictionary Value** – key `glucoseMeasurement`
12. **Set Variable** – name `Reading`
13. **Get Dictionary Value** – key `ValueInMgPerDl` in **Reading**
14. **Set Variable** – name `BG`
15. **Get Dictionary Value** – key `FactoryTimestamp`. Change the input after "in" to the **Reading** variable.
16. **URL Encode** – **Encode**
17. **Set Variable** – name `Time`
18. **Get Dictionary Value** – key `TrendArrow`. Change the input after "in" to the **Reading** variable.
19. **Set Variable** – name `Trend`
20. **URL** – type the calculator's address followed by `?libre=1&bg=`
    (for this copy: `https://markwendelllontocdotcom.github.io/Insuline_Dose_Calc_2026/?libre=1&bg=`), then insert
    **BG**, type `&ts=` then insert **Time**, type `&trend=` then insert **Trend**
21. **Open URLs**

Before running it, check every typed item letter by letter, including capital letters: `email`, `password`,
`product`, `llu.ios`, `version`, the email address and the password. The keyboard can change the first letter to a
capital, and then the sign-in fails.

Tap **Done**. Run it once. Whenever iPhone asks whether the Shortcut may connect to `api-ae.libreview.io`
(it can ask more than once), tap **Always Allow**. The calculator opens in Safari with the reading box.

To put it on the Home Screen: open the Shortcut, tap its name at the top (or **ⓘ**) → **Add to Home Screen**.
You can use the calculator icon: save `icons/icon-512.png` to Photos first and choose it as the picture.

### 3. If it does not work

The calculator says **"Could not get a reading from Libre"** when anything goes wrong. To see why, add a
**Quick Look** action straight after action 1, run the Shortcut and read what it shows (remove it afterwards):

- `"redirect":true` and `"region":"xx"`: your account is on another server. Change `ae` to that region
  (for example `eu`) in the addresses of actions 1 and 8.
- `"status":2`: wrong email or password.
- `"step"` with `"tou"` or `"pp"`: open the LibreLinkUp app, sign in and accept the terms.

If action 1 looks fine, move the Quick Look to straight after action 8:

- `"status":920` or a message about the version: change `4.16.0` in actions 1 and 8 to the version shown in the
  LibreLinkUp app (**Menu** → **About**).
- `"data":[]`: the follow invitation has not been accepted yet.

If the Shortcut stops with an error (for example no internet), open the calculator from its own icon and type the reading.

## Changing the plan later

1. On GitHub open `app.js`, click the pencil icon and change the numbers in `DOSE_PLAN`
   (and `planTitle` if the plan has a new name or year). Click **Commit changes**.
2. Open `service-worker.js` the same way and raise `CACHE_VERSION` by one (for example `v4` to `v5`).
   Commit. Without this step phones keep the old version.
3. On the iPhone open the app while online. It updates itself when nothing has been typed yet;
   otherwise a blue bar says “A new version is ready – tap here to reload”.
4. Check the **Plan** tab shows the new numbers. The **Instructions** tab shows which offline copy is in use (v1, v2 …).

## Running the tests (optional, needs Node.js 18 or newer)

```
node --test
```

Run it from this folder. The tests cover the required cases, every correction band boundary in every column,
the arrows, the rounding, the colours, the messages, the clock-based meal time and the Libre reading checks.
