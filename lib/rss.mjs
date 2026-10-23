// Parser del feed RSS público de YouTube (sin API key).
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };
const dec = s => s.replace(/&(amp|lt|gt|quot|#39|apos);/g, m => ENT[m]);
const tag = (blk, re) => { const m = blk.match(re); return m ? dec(m[1]).trim() : ''; };

export function parseFeed(xml, host = 'north-business-web.pages.dev') {
  const out = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const b = m[1];
    const id = tag(b, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!/^[\w-]{11}$/.test(id)) continue;
    const link = tag(b, /<link rel="alternate" href="([^"]+)"/);
    const desc = tag(b, /<media:description>([\s\S]*?)<\/media:description>/);
    const esc = host.replace(/\./g, '\\.');
    const t = desc.match(new RegExp('https?://' + esc + '[^\\s<>"\']*', 'i'));
    const views = parseInt(tag(b, /<media:statistics views="(\d+)"/), 10);
    out.push({
      id,
      title: tag(b, /<title>([^<]*)<\/title>/),
      url: link || 'https://www.youtube.com/watch?v=' + id,
      short: /\/shorts\//.test(link),
      published: tag(b, /<published>([^<]+)<\/published>/),
      thumb: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg',
      views: Number.isFinite(views) ? views : null,
      tool: t ? t[0].replace(/[.,;)]+$/, '') : null,
    });
  }
  return out;
}
