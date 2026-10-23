// Carga los videos del canal desde /api/videos. Si falla, la sección se queda oculta.
(function () {
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function safeYT(u) { return /^https:\/\/www\.youtube\.com\//.test(u) ? u : '#'; }
  function card(v) {
    var a = el('a', 'card vid'); a.href = safeYT(v.url); a.target = '_blank'; a.rel = 'noopener';
    var img = el('img'); img.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(v.id) + '/hqdefault.jpg'; img.alt = ''; img.loading = 'lazy';
    a.appendChild(img);
    var body = el('div', 'vb');
    if (v.short) body.appendChild(el('span', 'tag soon', 'Short'));
    body.appendChild(el('h3', '', v.title));
    var d = new Date(v.published);
    if (!isNaN(d)) body.appendChild(el('p', '', d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })));
    a.appendChild(body);
    return a;
  }
  fetch('/api/videos').then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (j) {
    var vids = (j.videos || []).slice();
    var list = document.getElementById('videos');
    if (list && vids.length) {
      vids.slice(0, 6).forEach(function (v) { list.appendChild(card(v)); });
      document.getElementById('videos-sec').hidden = false;
    }
    var slot = document.getElementById('watch');
    if (slot) {
      var path = slot.getAttribute('data-tool');
      var m = vids.filter(function (v) { return v.tool && v.tool.indexOf(path) !== -1 && !v.short; })[0];
      if (m) {
        var a = el('a', 'note good'); a.href = safeYT(m.url); a.target = '_blank'; a.rel = 'noopener';
        a.textContent = '▶ Watch the video: ' + m.title;
        slot.appendChild(a);
      }
    }
  }).catch(function () {});
})();
