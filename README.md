# SocialShare

A few share buttons shouldn’t need a bloated script to do a simple job. SocialShare’s **minified JavaScript and CSS come to just 12.2 kB combined**. No frameworks, icon fonts or runtime dependencies.

**[Use the SocialShare generator](https://subtledifference.com.au/resource-display/socialshare-button-builder)** to choose your buttons, colours and layout, see a live preview and copy the code for your site.

Version 1.1.1: 7.3 kB JavaScript + 4.9 kB CSS, before compression.

Inline and fixed layouts, text labels, optional custom icons, and all existing service classes remain supported.

## Quick start

Copy `src/socialshare.min.css`, `src/socialshare.min.js` and `LICENSE` into your project. Include the assets using your own paths:

~~~html
<link rel="stylesheet" href="/assets/socialshare.min.css">
<script src="/assets/socialshare.min.js" defer></script>

<nav class="socialshare inlinesocials"
     aria-label="Share this page"
     data-ss-platforms="facebook linkedin bluesky email copy"></nav>
~~~

The script creates labelled links and buttons. There are no icon fonts, external scripts, tracking calls or runtime package dependencies. See the [working demo](src/example.html).

Use `fixedsocials` instead of `inlinesocials` for a group at the left of larger screens and the bottom at widths of 990px or less. Keep fixed lists short and reserve space in your page so they do not cover content. The demo shows one approach.

## Configuration

Set these attributes on a `.socialshare` container or, except for `data-ss-platforms`, on an individual control. A control's value overrides its container, including an explicitly empty value.

| Attribute | Purpose |
| --- | --- |
| `data-ss-platforms` | Space- or comma-separated actions to generate. Omit this when supplying your own markup. |
| `data-ss-url` | Public URL to share. Defaults to the current complete page address. |
| `data-ss-text` | Optional accompanying text. Used by X/Twitter, Bluesky, WhatsApp, email, SMS and native sharing. |
| `data-ss-handle` | Optional X/Twitter `via` handle. |
| `data-ss-action` | Explicit action on a link or button; takes precedence over service classes. |
| `data-ss-title` | Existing tooltip label; supplies an accessible name and a native title when the host has not supplied its own. |

Supported actions:

- Sharing sites: `facebook`, `twitter` (or `x`), `bluesky`, `linkedin`, `reddit`, `whatsapp`, `pinterest`, `mastodon`, `blogger`, `digg`, `evernote`, `flipboard`, `tumblr`, `vk`, `rocketchat`, `weibo`, `xing`.
- Local handlers: `email`, `sms`, `messenger`.
- Other actions: `copy`, `print`, `printPDF`, `share`.

`printPDF` retains its existing **PrintFriendly** destination: it sends the chosen URL to an external service. `print` opens the browser's print dialog, which may offer local PDF output. The Mastodon adapter retains the existing `mastodon.social` destination; it does not select a user's instance. Legacy destinations remain available for compatibility; their current provider-side support is not guaranteed.

`share` opens the device's native share chooser when available, over HTTPS and after user activation. Without browser support, the generated button is labelled **Copy link** and copies instead. Cancelling the chooser does nothing further.

Copy uses the Clipboard API over HTTPS, with a checked legacy fallback when that API is unavailable. Permission failures produce a status message rather than a false success alert.

## Existing integrations

Existing `.socialshare`, `.social-icons`, `.inlinesocials`, `.fixedsocials` and `.customtheme` markup works. Service classes can appear anywhere in the class list, alongside your own styling classes.

~~~html
<nav class="socialshare inlinesocials customtheme" aria-label="Share this page">
    <ul class="social-icons">
        <li><a href="#" class="facebook my-button">Facebook</a></li>
        <li><a href="#" class="twitter" data-ss-handle="SubtleDiff">X / Twitter</a></li>
        <li><a href="#" class="copy">Copy link</a></li>
    </ul>
</nav>
~~~

Existing child icon markup, custom accessible names and labels are preserved. If you keep a font icon supplied by your website, that icon still needs its own assets; SocialShare itself does not require them. Replace the icon with text or your own inline SVG to remove that requirement. For example:

~~~html
<button type="button" data-ss-action="copy">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2">
        <path d="M8 8h12v12H8zM4 16V4h12"/>
    </svg>
    Copy link
</button>
~~~

Place explicit controls inside `.socialshare`. Prefer real buttons for copy, print and native-share actions; legacy action anchors remain supported, including Space-key activation. Generated links have actual sharing destinations, preserve modified-click behaviour and use `noopener`.

Unknown actions are ignored rather than opening a malformed URL. Loading the script twice or calling `init()` repeatedly does not duplicate controls or listeners.

## Styling

The CSS keeps the existing layout/service class hooks. Brand shades are darkened where needed for readable white labels; custom themes no longer need `!important`.

~~~css
.socialshare.customtheme {
    --ss-background: #4e1741;
    --ss-color: #fff;
    --ss-size: 44px;
    --ss-radius: 8px;
    --ss-gap: 12px;
    --ss-focus: #111;
}
~~~

Other fixed-layout options are `--ss-top`, `--ss-left`, `--ss-bottom` and `--ss-z-index`. Custom icons use `currentColor`. Keyboard focus and reduced-motion preferences are handled by the stylesheet. The old CSS-generated tooltip is replaced by a native title and an accessible name.

## JavaScript API

- `SocialShare.init(root = document)` prepares a newly inserted container or controls. Click handling is delegated, so new legacy controls also work on first activation.
- `SocialShare.getShareUrl(action, { url, text, handle })` returns a destination using **raw**, unencoded values. It returns `null` for unsupported actions and for copy, print and native share.
- The existing global `getShareUrl(action, encodedUrl, handle, encodedText)` is retained. Its URL and text arguments stay URI-encoded; `handle` stays raw. Copy and print retain their side effects and return `null`. External callers opening returned strings must apply their own `noopener` isolation.

Scripts can load before or after DOM readiness. The readable and minified distributions expose the same API.

## Privacy and browser support

Select a public `data-ss-url` when the current address contains private query values or fragments. SocialShare does not automatically remove those parts because some applications need them. No sharing request is sent on page load. Opening a provider's share page does not prove that a post was published.

Use modern browsers with JavaScript ES2020, URL/URLSearchParams, CSS variables, flex gap, `:is()` and `:focus-visible`. Native sharing and clipboard availability vary by browser, permissions and secure context. IE is not supported. No polyfills are loaded.

## Development

Node.js 22 or later is required for development only:

~~~sh
npm ci
npm run check
~~~

`build` synchronises the version from `package.json` and the complete MIT notice from `LICENSE` into the source files and regenerates both minified distributions with pinned esbuild. The build fails if the minifier drops the notice. `check` builds and runs the compatibility, security and release checks. `node scripts/build.mjs --check` verifies that all generated files are current without rewriting them. Commit regenerated files alongside source changes. Tests do not contact sharing services or send messages.

See the [changelog](CHANGELOG.md) for release notes. For the next version, run `npm version patch --no-git-tag-version` (or `minor` for compatible new features), update the changelog, then run `npm run check` before committing and tagging the release.

For a local demo, run `python -m http.server 8080 --bind 127.0.0.1` at the repository root and open `http://127.0.0.1:8080/src/example.html`. Test real destination login, native applications and publication separately when deploying.

## Licence

[MIT](LICENSE) — copyright Subtle Difference. The readable and minified SocialShare JavaScript/CSS each include the full copyright, permission and warranty notice, so a standalone file carries its licence with it. The demo HTML/CSS also carry the notice. Keep these notices intact and retain `LICENSE` when redistributing the project.
