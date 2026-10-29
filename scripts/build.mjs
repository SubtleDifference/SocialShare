import { readFile, writeFile } from 'node:fs/promises';
import { transform } from 'esbuild';

const normalise = text => text.replace(/\r\n/g, '\n');
const read = async name => normalise(await readFile(new URL('../' + name, import.meta.url), 'utf8'));
const { version } = JSON.parse(await read('package.json'));
const license = (await read('LICENSE')).trim();
const check = process.argv.includes('--check');
if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(version)) throw new Error('Invalid release version');
const title = 'SocialShare v' + version;
const banner = '/*!\n' + title + '\n\n' + license + '\n*/';
const stripNotice = source => source.replace(/^\/\*!\s*(?:\*\s*)?SocialShare[\s\S]*?\*\/\s*/, '');

async function save(name, content) {
    let current = '';
    try { current = await read(name); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (current !== content) {
        if (check) throw new Error(name + ' is stale. Run npm run build.');
        await writeFile(new URL('../' + name, import.meta.url), content);
    }
    console.log(name + ': ' + (check ? 'verified' : Buffer.byteLength(content) + ' bytes'));
}

for (const extension of ['js', 'css']) {
    const input = 'src/socialshare.' + extension;
    let body = stripNotice(await read(input));
    if (extension === 'js') {
        const declaration = /const VERSION = '[^']+';/;
        if (!declaration.test(body)) throw new Error('Missing SocialShare VERSION declaration');
        body = body.replace(declaration, "const VERSION = '" + version + "';");
    }
    const source = banner + '\n' + body;
    const result = await transform(source, {
        loader: extension, minify: true, legalComments: 'inline',
        target: extension === 'js' ? 'es2020' : ['chrome99', 'firefox97', 'safari15.4']
    });
    if (!result.code.includes(banner)) throw new Error('Minifier removed the full MIT notice from ' + input);
    await save(input, source);
    await save('src/socialshare.min.' + extension, result.code);
}

await save('src/example.css', banner + '\n' + stripNotice(await read('src/example.css')));
const html = (await read('src/example.html')).replace(/^<!doctype html>\s*/i, '')
    .replace(/^<!--\s*SocialShare[\s\S]*?-->\s*/, '');
await save('src/example.html', '<!doctype html>\n<!--\n' + title + '\n\n' + license + '\n-->\n' + html);
