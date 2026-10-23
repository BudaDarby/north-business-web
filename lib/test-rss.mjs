import { parseFeed } from './rss.mjs';
import assert from 'node:assert/strict';
const xml = `<feed><entry><yt:videoId>-kZ5Gl4cHdk</yt:videoId><title>Why a Business Can Sell &amp; Run Out</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=-kZ5Gl4cHdk"/><published>2026-10-22T18:53:32+00:00</published>
<media:group><media:description>Try it: https://north-business-web.pages.dev/break-even/?utm_source=youtube. Thanks</media:description>
<media:community><media:statistics views="4"/></media:community></media:group></entry>
<entry><yt:videoId>7K9HrgRJviE</yt:videoId><title>Short</title><link rel="alternate" href="https://www.youtube.com/shorts/7K9HrgRJviE"/>
<published>2026-10-22T17:52:13+00:00</published><media:group><media:description>no link</media:description></media:group></entry>
<entry><yt:videoId>bad</yt:videoId><title>x</title></entry></feed>`;
const v = parseFeed(xml);
assert.equal(v.length, 2);
assert.equal(v[0].title, 'Why a Business Can Sell & Run Out');
assert.equal(v[0].views, 4);
assert.equal(v[0].short, false);
assert.equal(v[0].tool, 'https://north-business-web.pages.dev/break-even/?utm_source=youtube');
assert.equal(v[1].short, true);
assert.equal(v[1].tool, null);
assert.equal(v[1].views, null);
assert.equal(v[1].thumb, 'https://i.ytimg.com/vi/7K9HrgRJviE/hqdefault.jpg');
console.log('RSS ALL PASSED');
