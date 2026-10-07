# EarnKit website — production deployment guide

This package is a static HTML/CSS/JavaScript website. No build step is required.

## Included

- `index.html` — landing page
- `how-it-works.html` — earning flow and points
- `features.html` — product features
- `security.html` — security/fraud model
- `faq.html` — FAQs
- `download.html` — APK release page
- `privacy.html` — privacy-policy draft
- `terms.html` — terms-of-use draft
- `assets/css/site.css` — production styling
- `assets/js/site.js` — interactions, theme, menu, counters and toast
- `assets/img/favicon.svg` — favicon
- `assets/img/og-cover.svg` — social preview
- `site.webmanifest` — installable web metadata
- `robots.txt` and `sitemap.xml` — crawler configuration

## Run locally

From this folder:

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Publish

Upload the **contents of this folder** to Netlify, Vercel static hosting, Firebase Hosting, GitHub Pages, or any normal static host.

Keep the `assets/` folder beside the HTML files.

## Enable the APK download

The supplied package intentionally does **not** contain a fake APK or a fake checksum.

After you have a signed release:

1. Put the real APK at `downloads/earnkit-vX.Y.Z.apk`.
2. Update the download button in `download.html` to the real file path.
3. Replace the release metadata and SHA-256 checksum with verified values.
4. Re-enable the download button.
5. Configure the server to serve `.apk` files as `application/vnd.android.package-archive`.

Example Windows checksum:

```powershell
Get-FileHash .\downloads\earnkit-vX.Y.Z.apk -Algorithm SHA256
```

## Before public launch

- Replace `https://earnkit.app` if your real domain is different.
- Replace `support@earnkit.app` with your monitored support address.
- Review the privacy policy and terms with qualified legal counsel.
- Confirm every earnings, payout, fraud, age and eligibility statement matches the actual app/backend.
- Test the site on Chrome/Edge/Firefox and Android mobile.
- Test dark mode, keyboard navigation, reduced-motion mode and all footer links.
- If the APK is distributed outside Google Play, provide users with a trustworthy signed release and a verifiable checksum.

## Important

The legal pages in this package are product-level drafts, not legal advice. They should be reviewed and adapted to the actual business, data flows, vendors and applicable law before production launch.
