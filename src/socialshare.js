/*!
SocialShare v1.1.1

MIT License

Copyright (c) 2023 Subtle Difference

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(() => {
    'use strict';

    const VERSION = '1.1.1';

    if (window.SocialShare?.version === VERSION) {
        window.SocialShare.init();
        return;
    }
    const labels = {
        facebook: 'Facebook', twitter: 'X / Twitter', bluesky: 'Bluesky', linkedin: 'LinkedIn',
        email: 'Email', sms: 'SMS', reddit: 'Reddit', whatsapp: 'WhatsApp', pinterest: 'Pinterest',
        mastodon: 'Mastodon', copy: 'Copy link', blogger: 'Blogger', digg: 'Digg', evernote: 'Evernote',
        flipboard: 'Flipboard', messenger: 'Messenger', print: 'Print', tumblr: 'Tumblr', vk: 'VK',
        rocketchat: 'Rocket.Chat', weibo: 'Weibo', xing: 'Xing', printPDF: 'PrintFriendly', share: 'Share…'
    };
    const endpoints = {
        facebook: ['https://www.facebook.com/sharer.php', 'u'],
        twitter: ['https://twitter.com/intent/tweet', 'url'],
        bluesky: ['https://bsky.app/intent/compose', 'text'],
        linkedin: ['https://www.linkedin.com/shareArticle', 'url'],
        email: ['mailto:', 'body'], sms: ['sms:', 'body'],
        reddit: ['https://www.reddit.com/submit', 'url'],
        whatsapp: ['https://api.whatsapp.com/send', 'text'],
        pinterest: ['https://www.pinterest.com/pin/create/button/', 'url'],
        mastodon: ['https://mastodon.social/share', 'url'],
        blogger: ['https://www.blogger.com/blog-this.g', 'url'],
        digg: ['https://digg.com/submit', 'url'],
        evernote: ['https://www.evernote.com/clip.action', 'url'],
        flipboard: ['https://share.flipboard.com/bookmarklet/popout?v=2', 'url'],
        messenger: ['fb-messenger://share/', 'link'],
        tumblr: ['https://www.tumblr.com/share/link', 'url'],
        vk: ['https://vk.com/share.php', 'url'],
        rocketchat: ['https://go.rocket.chat/home', 'msg'],
        weibo: ['https://service.weibo.com/share/share.php', 'url'],
        xing: ['https://www.xing.com/app/user?op=share', 'url'],
        printPDF: ['https://www.printfriendly.com/print', 'url']
    };
    const selector = '.social-icons a, .social-icons button, .socialshare [data-ss-action]';
    const prepared = new WeakSet();
    const regions = new WeakMap();
    const protocols = new Set(['email', 'sms', 'messenger']);
    const known = action => Object.prototype.hasOwnProperty.call(labels, action);
    const normalise = action => action === 'x' ? 'twitter' : action;

    function actionFor(control) {
        const explicit = control.dataset.ssAction;
        if (explicit !== undefined) return normalise(explicit);
        return [...control.classList].map(normalise).find(known);
    }

    function dataFor(control) {
        const group = control.closest('.socialshare');
        const read = (key, fallback = '') => control.dataset[key] ?? group?.dataset[key] ?? fallback;
        return { url: read('ssUrl', window.location.href), text: read('ssText'), handle: read('ssHandle') };
    }

    // Keep inputs raw; URLSearchParams performs the one encoding step.
    function buildUrl(action, { url = window.location.href, text = '', handle = '' } = {}) {
        action = normalise(action);
        if (!known(action) || !endpoints[action]) return null;
        const [endpoint, parameter] = endpoints[action];
        // Preserve Xing's legacy semicolon separator for existing consumers.
        if (action === 'xing') return endpoint + ';url=' + encodeURIComponent(url);
        const destination = new URL(endpoint);
        const message = text ? text + '\n' + url : url;
        const value = action === 'rocketchat' ? 'Check out this link: ' + url
            : ['bluesky', 'whatsapp', 'email', 'sms'].includes(action) ? message : url;
        destination.searchParams.set(parameter, value);
        if (action === 'twitter') {
            if (handle) destination.searchParams.set('via', handle);
            if (text) destination.searchParams.set('text', text);
        }
        // Native URI handlers use percent encoding, not HTML form '+' spacing.
        return protocols.has(action) ? destination.href.replace(/\+/g, '%20') : destination.href;
    }

    function statusRegion(root) {
        if (!regions.has(root) || regions.get(root).parentNode !== root) {
            const region = document.createElement('span');
            region.className = 'ss-status';
            region.setAttribute('role', 'status');
            region.setAttribute('aria-live', 'polite');
            region.setAttribute('aria-atomic', 'true');
            root.appendChild(region);
            regions.set(root, region);
        }
        return regions.get(root);
    }

    function announce(message, control) {
        const region = statusRegion(control?.closest('.socialshare') || document.body);
        region.textContent = '';
        region.appendChild(document.createTextNode(message));
    }

    async function copyUrl(url, control) {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                // Compatibility fallback when the modern Clipboard API is unavailable.
                const active = document.activeElement;
                const input = document.createElement('textarea');
                input.value = url;
                input.setAttribute('readonly', '');
                input.style.cssText = 'position:fixed;left:-9999px;top:0';
                document.body.appendChild(input);
                try {
                    input.select();
                    if (!document.execCommand('copy')) throw new Error('Copy failed');
                } finally {
                    input.remove();
                    active?.focus({ preventScroll: true });
                }
            }
            announce('Link copied.', control);
            return true;
        } catch {
            announce('Couldn’t copy the link. Copy the address from your browser instead.', control);
            return false;
        }
    }

    // All external browsing contexts pass through this isolation boundary.
    function openShare(url, action) {
        const popup = action === 'facebook' || action === 'linkedin';
        window.open(url, '_blank', popup ? 'noopener,popup,width=600,height=800' : 'noopener');
    }

    async function activate(action, data, control) {
        if (action === 'copy') return copyUrl(data.url, control);
        if (action === 'print') return window.print();
        if (action === 'share') {
            if (!navigator.share) return copyUrl(data.url, control);
            try {
                await navigator.share({ url: data.url, text: data.text, title: document.title });
            } catch (error) {
                if (error.name !== 'AbortError') announce('Couldn’t share this link. Try Copy link instead.', control);
            }
            return;
        }
        const url = buildUrl(action, data);
        if (!url) return;
        if (protocols.has(action)) window.location.href = url;
        else openShare(url, action);
    }

    function prepare(control) {
        const action = actionFor(control);
        if (!known(action)) return;
        if (!prepared.has(control)) {
            prepared.add(control);
            control.classList.add('ss-control', action);
            const label = action === 'share' && !navigator.share ? labels.copy : labels[action];
            if (!control.textContent.trim() && !control.children.length) control.textContent = label;
            if (control.textContent.trim()) control.classList.add('ss-text');
            if (!control.hasAttribute('aria-label') && !control.hasAttribute('aria-labelledby')) {
                control.setAttribute('aria-label', control.dataset.ssTitle || control.textContent.trim() || label);
            }
            if (control.dataset.ssTitle && !control.hasAttribute('title')) control.title = control.dataset.ssTitle;
            if (control.tagName === 'BUTTON' && !control.hasAttribute('type')) control.type = 'button';
        }
        if (control.tagName === 'A') {
            const href = buildUrl(action, dataFor(control));
            if (href) {
                control.href = href;
                if (!protocols.has(action)) {
                    control.target = '_blank';
                    control.relList.add('noopener');
                }
            } else if (['copy', 'print', 'share'].includes(action)) control.setAttribute('role', 'button');
        }
        statusRegion(control.closest('.socialshare') || document.body);
    }

    function init(root = document) {
        const groups = [...root.querySelectorAll('.socialshare[data-ss-platforms]')];
        if (root.matches?.('.socialshare[data-ss-platforms]')) groups.unshift(root);
        groups.forEach(group => {
            if (group.querySelector('.social-icons')) return;
            const list = document.createElement('ul');
            list.className = 'social-icons';
            for (const name of group.dataset.ssPlatforms.split(/[\s,]+/)) {
                const action = normalise(name);
                if (!known(action)) continue;
                const item = document.createElement('li');
                const control = document.createElement(['copy', 'print', 'share'].includes(action) ? 'button' : 'a');
                control.dataset.ssAction = action;
                item.appendChild(control);
                list.appendChild(item);
            }
            group.appendChild(list);
        });
        const controls = [...root.querySelectorAll(selector)];
        if (root.matches?.(selector)) controls.unshift(root);
        controls.forEach(prepare);
    }

    document.addEventListener('click', event => {
        const control = event.target.closest?.(selector);
        if (!control || !known(actionFor(control))) return;
        if (control.disabled || control.getAttribute('aria-disabled') === 'true') {
            event.preventDefault();
            return;
        }
        prepare(control);
        const action = actionFor(control);
        const destination = buildUrl(action, dataFor(control));
        // Keep native new-tab / modified-click behaviour for real links.
        if (control.tagName === 'A' && destination && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return;
        event.preventDefault();
        void activate(action, dataFor(control), control);
    });
    document.addEventListener('keydown', event => {
        const control = event.target.closest?.(selector);
        if (event.key === ' ' && control?.tagName === 'A' && ['copy', 'print', 'share'].includes(actionFor(control))) {
            event.preventDefault();
            control.click();
        }
    });

    window.SocialShare = { version: VERSION, init, getShareUrl: buildUrl };
    // Preserve the classic helper's encoded URL/text inputs and copy/print side effects.
    window.getShareUrl = (action, url, handle, text) => {
        const decode = value => {
            try { return decodeURIComponent(value || ''); } catch { return value || ''; }
        };
        const data = { url: decode(url), handle, text: decode(text) };
        if (action === 'copy') { void copyUrl(data.url); return null; }
        if (action === 'print') { window.print(); return null; }
        return buildUrl(action, data);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(), { once: true });
    else init();
})();
