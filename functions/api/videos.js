import { parseFeed } from '../../lib/rss.mjs';
const CHANNEL = 'UCj5oZWO2H2aDFYDW7Qh3oJQ';

export async function onRequestGet() {
  const h = { 'content-type': 'application/json; charset=utf-8' };
  try {
    const r = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + CHANNEL, {
      cf: { cacheTtl: 900, cacheEverything: true },
    });
    if (!r.ok) throw new Error('feed ' + r.status);
    const videos = parseFeed(await r.text());
    return new Response(JSON.stringify({ videos }), {
      headers: { ...h, 'cache-control': 'public, max-age=300, s-maxage=900' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ videos: [], error: 'feed_unavailable' }), {
      status: 502, headers: { ...h, 'cache-control': 'no-store' },
    });
  }
}
