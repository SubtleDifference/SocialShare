const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const pageUrl = 'https://example.test/article?section=design&sort=new#details';
const files = process.env.SOCIALSHARE_SCRIPT ? [process.env.SOCIALSHARE_SCRIPT] : ['src/socialshare.js', 'src/socialshare.min.js'];

// A small browser boundary stub. Browser/layout checks use real Chromium separately.
function fixture(file, definitions = [], options = {}) {
    const listeners = {}, opened = [], copied = [], navigated = [];
    let printCount = 0, prevented = 0;
    function element(tag, className = '', dataset = {}, textContent = '') {
        const classes = new Set(className.split(/\s+/).filter(Boolean)), attributes = new Map();
        const node = {
            tagName: tag.toUpperCase(), dataset, textContent, children: [], style: {},
            classList: { add: (...names) => names.forEach(name => classes.add(name)), [Symbol.iterator]: () => classes[Symbol.iterator]() },
            relList: { add: name => attributes.set('rel', name) },
            get className() { return [...classes].join(' '); },
            set className(value) { classes.clear(); value.split(/\s+/).forEach(name => classes.add(name)); },
            setAttribute(name, value) { attributes.set(name, value); },
            getAttribute: name => attributes.get(name) ?? null,
            hasAttribute: name => attributes.has(name),
            closest: selector => selector === '.socialshare' ? null : node,
            appendChild(child) { node.children.push(child); child.parent = child.parentNode = node; if (child.tagName === '#TEXT') node.textContent += child.textContent; return child; },
            removeChild(child) { node.children.splice(node.children.indexOf(child), 1); child.parentNode = null; },
            remove() { node.parent.removeChild(node); }, select() {}, focus() {},
            addEventListener(name, callback) { node[name] = callback; }
        };
        return node;
    }
    const controls = definitions.map(item => {
        const node = element(item.tag || 'a', item.className || '', item.dataset || {}, item.text || '');
        if (item.icon) node.appendChild(element('i', 'custom-icon'));
        return node;
    });
    const document = {
        title: 'Example title', readyState: options.readyState || 'loading', body: element('body'),
        activeElement: { focus() {} },
        addEventListener(name, callback) { (listeners[name] ||= []).push(callback); },
        querySelectorAll: selector => selector === '.socialshare[data-ss-platforms]' ? [] : controls,
        createElement: tag => element(tag),
        createTextNode: text => element('#text', '', {}, text),
        execCommand: () => options.fallbackSuccess ?? true
    };
    const navigator = {};
    if (!options.noClipboard) navigator.clipboard = { writeText: async value => {
        if (options.copyError) throw new Error('Permission denied');
        copied.push(value);
    }};
    if (options.share) navigator.share = options.share;
    const location = {
        get href() { return navigated.at(-1) || pageUrl; },
        set href(value) { navigated.push(value); }
    };
    const window = { location, open: (...args) => opened.push(args), print: () => printCount++ };
    const context = vm.createContext({ document, window, navigator, URL, console, open: window.open, alert() {} });
    const source = fs.readFileSync(path.resolve(file), 'utf8');
    const load = () => vm.runInContext(source, context);
    load();
    (listeners.DOMContentLoaded || []).forEach(callback => callback());
    const click = async (index = 0, modifiers = {}) => {
        const event = { target: controls[index], preventDefault() { prevented++; }, ...modifiers };
        if (controls[index].click) controls[index].click(event); // Original direct-listener implementation.
        else for (const listener of listeners.click || []) listener(event);
        await new Promise(resolve => setImmediate(resolve));
    };
    return {
        window, controls, opened, copied, navigated, document, listeners, click, load,
        status: () => document.body.children.filter(child => child.className === 'ss-status').at(-1)?.textContent,
        prints: () => printCount, prevented: () => prevented
    };
}

for (const file of files) {
    test(file + ': outside share windows are isolated', async () => {
        for (const className of ['facebook', 'linkedin', 'twitter', 'bluesky', 'reddit', 'whatsapp', 'pinterest', 'mastodon', 'blogger', 'digg', 'evernote', 'flipboard', 'tumblr', 'vk', 'rocketchat', 'weibo', 'xing', 'printPDF']) {
            const app = fixture(file, [{ className }]);
            await app.click();
            assert.equal(app.opened.length, 1, className);
            assert.ok(app.opened[0][2]?.split(',').includes('noopener'), className + ' must sever opener');
            assert.equal(app.opened[0][1], '_blank');
        }
    });
    test(file + ': extra CSS classes and explicit actions select the intended platform', async () => {
        for (const definition of [
            { className: 'extra facebook another' },
            { className: 'extra', dataset: { ssAction: 'facebook' } }
        ]) {
            const app = fixture(file, [definition]);
            await app.click();
            assert.equal(new URL(app.opened[0][0]).hostname, 'www.facebook.com');
        }
    });
    test(file + ': query values round-trip exactly once, including reserved characters', () => {
        const app = fixture(file), api = app.window.SocialShare.getShareUrl;
        const raw = 'https://example.test/a%20b?q=one&next=%2Ftwo#ü';
        for (const [action, parameter] of [['facebook', 'u'], ['twitter', 'url'], ['messenger', 'link'], ['email', 'body'], ['sms', 'body'], ['bluesky', 'text'], ['whatsapp', 'text']]) {
            assert.equal(new URL(api(action, { url: raw })).searchParams.get(parameter), raw, action);
        }
        assert.equal(new URL(api('rocketchat', { url: raw })).searchParams.get('msg'), 'Check out this link: ' + raw);
        const twitter = new URL(api('twitter', { url: raw, handle: 'name&text=oops#fragment', text: 'A & B\n你好' }));
        assert.equal(twitter.searchParams.get('via'), 'name&text=oops#fragment');
        assert.equal(twitter.searchParams.get('text'), 'A & B\n你好');
        assert.equal(twitter.hash, '');
        assert.equal(api('xing', { url: raw }), 'https://www.xing.com/app/user?op=share;url=' + encodeURIComponent(raw));
    });
    test(file + ': omitted optional text does not become undefined', async () => {
        const app = fixture(file, [{ className: 'twitter' }]);
        await app.click();
        assert.equal(new URL(app.opened[0][0]).searchParams.has('text'), false);
    });
    test(file + ': native URI handlers receive percent-encoded spaces, not form pluses', () => {
        const api = fixture(file).window.SocialShare.getShareUrl;
        for (const action of ['email', 'sms']) {
            const uri = api(action, { url: pageUrl, text: 'Hello world + symbols' });
            assert.ok(uri.includes('Hello%20world%20%2B%20symbols'));
            assert.equal(uri.includes('+'), false);
        }
        const messenger = api('messenger', { url: 'https://example.test/a b?q=+' });
        assert.ok(messenger.includes('a%20b'));
        assert.ok(messenger.includes('%2B'));
    });
    test(file + ': unknown and inherited object names leave normal links alone', async () => {
        for (const action of ['unknown', '__proto__', 'constructor', 'toString']) {
            const app = fixture(file, [{ className: action, dataset: { ssAction: action } }]);
            await app.click();
            assert.equal(app.opened.length, 0);
            assert.equal(app.prevented(), 0);
            assert.equal(app.window.SocialShare.getShareUrl(action), null);
        }
    });
    test(file + ': the encoded-argument legacy helper and its print/copy side effects remain', async () => {
        const app = fixture(file);
        const url = app.window.getShareUrl('twitter', encodeURIComponent(pageUrl), 'a&b', encodeURIComponent('Hello & goodbye'));
        assert.equal(new URL(url).searchParams.get('url'), pageUrl);
        assert.equal(new URL(url).searchParams.get('text'), 'Hello & goodbye');
        assert.equal(new URL(url).searchParams.get('via'), 'a&b');
        assert.equal(app.window.getShareUrl('print', encodeURIComponent(pageUrl)), null);
        assert.equal(app.prints(), 1);
        assert.equal(app.window.getShareUrl('copy', encodeURIComponent(pageUrl)), null);
        await new Promise(resolve => setImmediate(resolve));
        assert.deepEqual(app.copied, [pageUrl]);
    });
    test(file + ': copy announces actual success and reports permission/fallback failures', async () => {
        const success = fixture(file, [{ className: 'copy' }]);
        await success.click();
        assert.deepEqual(success.copied, [pageUrl]);
        assert.equal(success.status(), 'Link copied.');
        for (const options of [{ copyError: true }, { noClipboard: true, fallbackSuccess: false }]) {
            const failure = fixture(file, [{ className: 'copy' }], options);
            await failure.click();
            assert.match(failure.status(), /Couldn’t copy/);
            assert.equal(failure.document.body.children.filter(child => child.tagName === 'TEXTAREA').length, 0);
            assert.equal(failure.opened.length, 0);
        }
        const fallback = fixture(file, [{ className: 'copy' }], { noClipboard: true });
        await fallback.click();
        assert.equal(fallback.status(), 'Link copied.');
    });
    test(file + ': protocols use current-window handlers and print opens no window', async () => {
        for (const [action, prefix] of [['email', 'mailto:'], ['sms', 'sms:'], ['messenger', 'fb-messenger:']]) {
            const app = fixture(file, [{ className: action }]);
            await app.click();
            assert.ok(app.navigated[0].startsWith(prefix));
            assert.equal(app.opened.length, 0);
        }
        const print = fixture(file, [{ className: 'print' }]);
        await print.click();
        assert.equal(print.prints(), 1);
        assert.equal(print.opened.length, 0);
    });
    test(file + ': reinitialisation restores status feedback removed by the host page', async () => {
        const app = fixture(file, [{ className: 'copy' }]);
        app.document.body.removeChild(app.document.body.children[0]);
        app.window.SocialShare.init();
        await app.click();
        assert.equal(app.status(), 'Link copied.');
    });
    test(file + ': repeat loading/init and late loading do not duplicate handlers or markup', async () => {
        const app = fixture(file, [{ className: 'facebook', icon: true }], { readyState: 'complete' });
        const icon = app.controls[0].children[0];
        app.window.SocialShare.init();
        app.load();
        await app.click();
        assert.equal(app.opened.length, 1);
        assert.equal(app.controls[0].children[0], icon);
        assert.equal(app.controls[0].getAttribute('aria-label'), 'Facebook');
        assert.equal(app.document.body.children.length, 1);
    });
    test(file + ': modified clicks refresh the real href without opening a scripted popup', async () => {
        const app = fixture(file, [{ className: 'facebook' }]);
        app.controls[0].dataset.ssUrl = 'https://example.test/other?x=1#y';
        await app.click(0, { ctrlKey: true });
        assert.equal(app.opened.length, 0);
        assert.equal(app.prevented(), 0);
        assert.equal(new URL(app.controls[0].href).searchParams.get('u'), 'https://example.test/other?x=1#y');
    });
    test(file + ': aria-disabled anchors cannot activate', async () => {
        const app = fixture(file, [{ className: 'facebook' }]);
        app.controls[0].setAttribute('aria-disabled', 'true');
        await app.click();
        assert.equal(app.opened.length, 0);
        assert.equal(app.prevented(), 1);
    });
    test(file + ': native sharing treats cancellation quietly and unavailable support falls back to copy', async () => {
        const cancelled = fixture(file, [{ className: 'share', tag: 'button' }], { share: async () => { throw { name: 'AbortError' }; } });
        await cancelled.click();
        assert.deepEqual(cancelled.copied, []);
        assert.equal(cancelled.status(), '');
        const unavailable = fixture(file, [{ className: 'share', tag: 'button' }]);
        await unavailable.click();
        assert.deepEqual(unavailable.copied, [pageUrl]);
        assert.equal(unavailable.controls[0].textContent, 'Copy link');
    });
}
