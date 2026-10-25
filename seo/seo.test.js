import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { seoFiles, seoPlugin, normalizeSiteUrl } from './build.js';
import { HOME_TITLE } from './site.js';
import { createApp } from '../server.js';

const built = file => readFile(new URL(`../dist/${file}`, import.meta.url));

test('SEO URLs follow the configured origin and reject invalid deployment addresses', () => {
  assert.equal(normalizeSiteUrl('https://example.com/'), 'https://example.com');
  const files = seoFiles('https://example.com/');
  for (const content of Object.values(files)) assert.ok(!content.includes('__SITE_URL__'));
  assert.match(files['robots.txt'], /Sitemap: https:\/\/example.com\/sitemap.xml/);
  assert.match(files['sitemap.xml'], /<loc>https:\/\/example.com\/<\/loc>/);
  assert.doesNotMatch(files['sitemap.xml'], /lastmod|changefreq|priority|chat.voicelk.dev/);
  for (const invalid of ['javascript:alert(1)', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com/?key=value', 'https://example.com/#hash']) {
    assert.throws(() => normalizeSiteUrl(invalid));
  }
});

test('development SEO files accept query strings without intercepting other requests', () => {
  let middleware;
  seoPlugin('https://example.com').configureServer({ middlewares: { use(fn) { middleware = fn; } } });
  let result;
  let type;
  middleware({ url: '/sitemap.xml?v=1' }, {
    setHeader(name, value) { if (name === 'Content-Type') type = value; },
    end(body) { result = body; },
  }, () => assert.fail('Sitemap request was not handled'));
  assert.match(type, /application\/xml/);
  assert.match(result, /https:\/\/example.com\//);
  let passed = false;
  middleware({ url: '/constructor' }, {}, () => { passed = true; });
  assert.equal(passed, true);
});

test('built metadata, sitemap, LLM summary and structured data agree on the canonical site', async () => {
  const html = (await built('index.html')).toString();
  assert.doesNotMatch(html, /__SITE_(URL|TITLE|DESCRIPTION)__/);
  assert.ok(html.includes(`<title>${HOME_TITLE}</title>`));
  const canonical = /rel="canonical" href="([^"]+)"/.exec(html)[1];
  const origin = new URL(canonical).origin;
  assert.equal(canonical, `${origin}/`);
  const sitemap = (await built('sitemap.xml')).toString();
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), [canonical]);
  assert.ok((await built('robots.txt')).toString().includes(`Sitemap: ${origin}/sitemap.xml`));
  const llms = (await built('llms.txt')).toString();
  assert.match(llms, /^# VoiceLK/);
  assert.ok(llms.includes(`[VoiceLK app](${canonical})`));
  assert.doesNotMatch(llms, /__SITE_URL__/);
  const schema = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1]);
  const website = schema['@graph'].filter(node => node['@type'] === 'WebSite');
  assert.equal(website.length, 1);
  assert.equal(website[0].name, 'VoiceLK');
  assert.equal(website[0].url, canonical);
  assert.equal(schema['@graph'].find(node => node['@type'] === 'WebApplication').url, canonical);
  for (const key of ['og:image', 'twitter:image']) assert.ok(html.includes(`"${key}" content="${origin}/og.png?v=code-switched-tts"`));
});

test('the built social preview dimensions match its declared metadata', async () => {
  const png = await built('og.png');
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.toString('ascii', 12, 16), 'IHDR');
  const html = (await built('index.html')).toString();
  assert.equal(png.readUInt32BE(16), Number(/property="og:image:width" content="(\d+)"/.exec(html)[1]));
  assert.equal(png.readUInt32BE(20), Number(/property="og:image:height" content="(\d+)"/.exec(html)[1]));
  assert.ok(png.readUInt32BE(16) >= 1200);
  assert.ok(Math.abs(png.readUInt32BE(16) / png.readUInt32BE(20) - 1200 / 630) < 0.01);
});

test('production serves SEO assets directly and returns real 404s for nonexistent URLs', async () => {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const [file, type] of [['robots.txt', /text\/plain/], ['llms.txt', /text\/plain/], ['sitemap.xml', /application\/xml/], ['og.png', /image\/png/]]) {
      const response = await fetch(`${base}/${file}?check=seo`);
      assert.equal(response.status, 200, file);
      assert.match(response.headers.get('content-type'), type);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await built(file));
    }
    const root = await fetch(base);
    assert.equal(root.status, 200);
    assert.match(root.headers.get('cache-control'), /no-cache/);
    assert.ok((await root.text()).includes(`<title>${HOME_TITLE}</title>`));
    const alias = await fetch(`${base}/index.html`, { redirect: 'manual' });
    assert.equal(alias.status, 301);
    assert.equal(alias.headers.get('location'), '/');
    for (const path of ['/missing-page', '/missing-image.png', '/assets/missing.js']) {
      const response = await fetch(base + path);
      assert.equal(response.status, 404);
      assert.equal(response.headers.get('x-robots-tag'), 'noindex');
      assert.equal(await response.text(), 'Not found');
    }
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

test('public metadata and copy describe code-switched speech without education positioning', async () => {
  const education = /\b(?:ICT|educational(?:application|audience)?|education|students?|syllabus|study assistant|O\/Level|O\/L)\b/i;
  for (const file of ['index.html', 'llms.txt']) {
    const content = (await built(file)).toString();
    assert.doesNotMatch(content, education);
    assert.match(content, /code-switched/i);
    assert.match(content, /VITS/);
  }
  for (const file of ['../src/pages/Help/Help.jsx', '../src/features/auth/components/AuthPage.jsx', '../src/pages/Home/Home.jsx']) {
    assert.doesNotMatch(await readFile(new URL(file, import.meta.url), 'utf8'), education);
  }
  const html = (await built('index.html')).toString();
  const schema = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1]);
  const app = schema['@graph'].find(node => node['@type'] === 'WebApplication');
  assert.equal(app.applicationCategory, 'MultimediaApplication');
  assert.equal(app.audience, undefined);
});
