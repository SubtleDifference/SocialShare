const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n');
const license = read('LICENSE').trim();
const { version } = JSON.parse(read('package.json'));

for (const name of ['src/socialshare.js', 'src/socialshare.min.js', 'src/socialshare.css',
    'src/socialshare.min.css', 'src/example.css', 'src/example.html']) {
    test(name + ': standalone file retains the complete MIT notice and release version', () => {
        const source = read(name);
        assert.ok(source.includes(license), 'Full LICENSE text must survive unchanged');
        assert.equal(source.split(license).length - 1, 1, 'Include one complete notice');
        assert.ok(source.includes('SocialShare v' + version));
        if (name.endsWith('.html')) assert.ok(source.startsWith('<!doctype html>\n<!--\n'));
        else assert.ok(source.startsWith('/*!\n'));
    });
}

for (const name of ['src/socialshare.js', 'src/socialshare.min.js']) {
    test(name + ': public runtime version matches package metadata', () => {
        const context = vm.createContext({
            window: {}, document: { readyState: 'loading', addEventListener() {} }
        });
        vm.runInContext(read(name), context);
        assert.equal(context.window.SocialShare.version, version);
    });
}

test('lockfile and changelog match the release version', () => {
    const lock = JSON.parse(read('package-lock.json'));
    assert.equal(lock.version, version);
    assert.equal(lock.packages[''].version, version);
    assert.match(read('CHANGELOG.md'), new RegExp('## \\[' + version.replace(/\./g, '\\.') + '\\]'));
});

test('generated distributions are reproducible and current', () => {
    const result = spawnSync(process.execPath, ['scripts/build.mjs', '--check'], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
});
