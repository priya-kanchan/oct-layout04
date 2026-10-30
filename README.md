# oct-layout04

Open `index.html` in a browser or serve this folder with any static server. No build step, Bootstrap, framework or CDN is required. Images are WebP; fonts and the country selector are local. GTF submission remains external, as required by your integration. Google Maps loads only on request.

The visual direction follows the supplied ivory reference image: translucent panels, broad directional shadows, stacked image frames, gold connector lines and raised circular details. These styles live in `css/atelier.css`, loaded after the base stylesheet. The reference website supplies the content and images; the layout has its own composition.

`css/responsive.css` sets readable text sizes and viewport-aware fitting. The desktop opening banner uses `100vh` with `100svh` on supporting browsers; the four project facts sit immediately below it. Mobile shows the tower image first, residence content second, and the enquiry form third. Its hero expands to fit these blocks. `main.js` moves the existing enquiry card into the mobile hero at widths up to 700px and restores it to the contact section above that breakpoint, preserving field IDs, entered values, country selection and submission handlers. Very short landscape windows expand naturally rather than clipping content. The sidebar's menu scrolls independently while the brand and contact button remain accessible. Body copy is generally 14–16px, and action labels no longer use the original 7–9px sizing.

Sections use individual compositions: a compact editorial overview with inset imagery, a featured residence with four open comparison options, a two-column highlights collection, a lifestyle mosaic, framed plan previews, an overlapping tour feature, map-led connectivity, a gallery mosaic, a developer spread, numbered FAQs and a split enquiry section. The fixed sidebar uses a numbered vertical timeline with a dark active state and a separate visit button. The hero ends with four project facts. Contact enquiry containers size to their content, and connector branches join each section label.

Scroll entrances use native IntersectionObserver and the Web Animations API: left/right reveals, staggered cards, zoom-in and zoom-out, replayed when elements re-enter the viewport or their section is selected from navigation. Animations preserve each card's existing rotation, leave content visible without JavaScript, and stop when an element receives keyboard focus. Reduced-motion preferences disable these effects. A measured gold gutter rail connects the section headings, with rounded branches, progress fill and highlighted nodes; its layout updates on resizing and content height changes.

## Form configuration before launch

Edit the inline integration near the bottom of `index.html`. Your supplied AgentInfo values are preserved, including masked `vAgentID: '****'` and the supplied Noida URLs. Set the assigned agent ID and confirm the project, production URL and thank-you URL for this campaign. A local `thanks.htm` is included. The supplied masked ID is passed through unchanged; set the real ID for your live campaign. No live enquiries were submitted during QA.

The contact form and popup retain `qSenderName`, `qEmailID`, `qMobileNo`, `qMessage` and the `popup` ID variants, plus `qCountryCode1` and `qCountryCode2`. Both call `SubmitQueryData(AgentInfo, FormInfo)` with `SenderControlCountryCodeID`. Local jQuery loads before the supplied integration. The external CRM script loads on page startup, as in the supplied snippet. The country selector defaults to India and keeps the country code separate. Flags are omitted to avoid PNG/SVG sprite dependencies.

## Content and SEO

Content and WebP imagery are retained from https://websitedesigningcompany.co.in/demo-gtf/kp-layout01/ . The presentation includes a fixed desktop sidebar, repeatable slide-up section navigation, mobile drawer, enquiry dialogs, gallery viewer, native FAQs and an on-demand map. Reduced-motion preferences are respected. All sections remain in the HTML for search engines and navigation without JavaScript.

The reference has placeholder project/address information and RERA entries. Confirm these before publication. Set the canonical URL, sitemap and social image URL when the hosting domain is known. Titles, description, semantic headings, accessible field names, local fonts, responsive hero images, lazy loading and image dimensions are included.

## Upload

Upload `index.html`, `disclaimer.html`, `thanks.htm` and the `css`, `js`, `fonts`, `images` directories. Preview images, QA reports, helper scripts and this README do not need to be uploaded.

## Verification

Headless Chrome checks passed at widths 320, 360, 390, 768, 1024, 1440 and 1920 pixels. All 12 sections are present; desktop and mobile section scans showed no horizontal overflow. Navigation animation, mobile menu, enquiry popup, gallery, privacy dialog and country-code synchronization (+971 for UAE) passed. No JavaScript exceptions or missing local resources were recorded. See `qa-results.json`. Production CRM delivery requires a valid agent ID and was not tested.

Scroll entrance and replay checks passed, as did reduced-motion handling. The rail has 11 heading nodes; the measured first-node alignment was within 1 pixel of its label center in the mobile browser check.

## Supplied form behavior

The enquiry containers use the supplied `div.p-3` structure with direct jQuery button-click handlers. Added required-field, browser-form, consent, phone-pattern, digit filtering, maximum-length and masked-agent checks have been removed. Country selection still updates the hidden country-code fields. Any validation performed inside the external GTF script remains controlled by that service. Browser integration checks intercept submissions with a stub; they do not send live leads.

The supplied static integration lives directly at the bottom of `index.html`: the timestamped GTF script loader, AgentInfo and separate jQuery click handlers for contact and popup. Local jQuery and country-selector scripts load synchronously before these blocks. No DOMContentLoaded wrapper, Promise loader, loading state, retry helper or added field validation is used. Country-code mapping is preserved.

The mobile enquiry popup uses compact spacing and no internal scrollbar. Short landscape layouts use two columns for the four inputs. Opening dialogs fixes the background body at its current scroll position; closing restores that position. Country lists and the separate privacy policy remain independently scrollable when needed.
