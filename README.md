# Rishav Kumar Singh — 3D Interactive Portfolio

Production-ready **static HTML/CSS/JavaScript** site featuring an interactive Three.js point cloud (with graceful fallback), accessible responsive layout, AI projects, work experience, a sanitized résumé, and a Netlify-compatible contact form. No build tools required.

## Quick preview

- Open `index.html` in a browser, or better, serve with `python -m http.server 8080` and visit `http://localhost:8080`.
- The Three.js effect requires an internet connection to load a CDN module. Everything else works without it.

## Go live via Netlify (recommended)

1. Open https://app.netlify.com/drop and sign in so you own and can manage the site.
2. Extract the downloaded portfolio ZIP and drag the inner **rishav-3d-portfolio folder** (the one containing `index.html`) onto Netlify Drop.
3. Netlify provides a public URL. Rename the site in Netlify dashboard > Site configuration (subject to availability).
4. To receive messages from the contact form, open the site dashboard > Forms > **Enable form detection**, then **redeploy** the same folder. Verify that `contact` appears under Forms. Submit a test and configure email notifications. Form detection is not active until enabled and deployed.
5. Optionally connect a custom domain under Domain management.

**Note:** This package is not deployed yet. A public URL only exists after you upload it to a hosting account. You must check the actual contact form delivery after deployment.

## Go live via GitHub Pages (alternative)

Upload these files to a public repo and enable Pages under Settings > Pages. GitHub Pages does not process Netlify Forms; instead use your `mailto:` link, or connect a form backend such as Formspree and change the form's endpoint. This version has been prepared for Netlify.

## Portrait included

Your supplied 400 × 400 portrait is already bundled at `assets/rishav-portrait.png` and referenced by `index.html`. No photo replacement is required for this release.

## Details worth confirming before wider launch

- Databricks credential: add full title, issuer, completion date, and public verification/badge link if available. Current card deliberately does not claim a specific credential.
- GitHub project URLs: link repos for Document Q&A, RBAC Task Manager and Smart Attendance if public. This build does not invent URLs.
- Streamlit chatbot: the exact user URL is linked, but its availability was not confirmed during build.
- The website contains a **public-safe tailored resume PDF** without your phone number. Your original four resumes are not copied into the site.
- All text is editable directly in `index.html`; colors and layout are in `styles.css`.

## Performance & privacy

- User phone number is not included anywhere in the site or bundled résumé.
- Three.js animation is paused off-screen and omitted when motion reduction is requested.
- Content is available when the 3D library cannot load.
- No website analytics, cookies, pixels, or external tracking scripts included.
- Google Fonts and Three.js load via Google/JSDelivr. To operate without third-party requests, self-host alternatives or remove these references.
