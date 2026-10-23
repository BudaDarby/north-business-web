(function () {
  var $ = function (id) { return document.getElementById(id); };
  var prods = $('prods'), out = $('out');
  var DEFAULT = [{ name: 'Coffee', price: 4, cost: 1.2, share: 100 }];
  var MAX = 5;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function addRow(p) {
    var d = document.createElement('div');
    d.className = 'prod';
    d.innerHTML =
      '<div class="nm"><label>Name</label><input type="text" class="pn" maxlength="24" value="' + esc(p.name) + '"></div>' +
      '<div><label>Price</label><input type="number" class="pp" inputmode="decimal" min="0" step="any" value="' + p.price + '"></div>' +
      '<div><label>Variable cost</label><input type="number" class="pc" inputmode="decimal" min="0" step="any" value="' + p.cost + '"></div>' +
      '<div class="share"><label>% of sales</label><input type="number" class="ps" inputmode="decimal" min="0" max="100" step="any" value="' + p.share + '"></div>' +
      '<button type="button" class="rm" aria-label="Remove product" title="Remove">×</button>';
    d.querySelector('.rm').onclick = function () { d.remove(); sync(); };
    prods.appendChild(d);
  }
  function rows() {
    return Array.prototype.map.call(prods.children, function (d) {
      return { name: d.querySelector('.pn').value, price: d.querySelector('.pp').value, cost: d.querySelector('.pc').value, share: d.querySelector('.ps').value };
    });
  }
  function sync() {
    var n = prods.children.length;
    Array.prototype.forEach.call(prods.children, function (d) { d.classList.toggle('single', n === 1); });
    $('add').style.display = n >= MAX ? 'none' : '';
    render();
  }

  var cur = function () { return $('cur').value || ''; };
  function money(x) {
    var neg = x < 0, a = Math.abs(x);
    var s = a.toLocaleString('en-US', { maximumFractionDigits: a < 100 ? 2 : 0, minimumFractionDigits: a < 100 ? 2 : 0 });
    return (neg ? '-' : '') + cur() + s;
  }
  function n0(x) { return (Math.round(x) + 0).toLocaleString('en-US').replace('-0', '0'); }
  function unit() { return ($('unit').value || 'sales').trim(); }

  function chart(r) {
    var W = 600, H = 300, L = 54, R = 16, T = 14, B = 40, pw = W - L - R, ph = H - T - B;
    var mx = r.maxUnits;
    var rev = function (u) { return r.avgPrice * u; }, cost = function (u) { return r.fixedTotal + r.avgCost * u; };
    var my = Math.max(rev(mx), cost(mx)) * 1.05;
    var X = function (u) { return L + (u / mx) * pw; }, Y = function (v) { return T + ph - (v / my) * ph; };
    var be = r.beUnits, s = '';
    s += '<polygon points="' + X(0) + ',' + Y(cost(0)) + ' ' + X(be) + ',' + Y(rev(be)) + ' ' + X(0) + ',' + Y(0) + '" fill="#ff5b6b" opacity=".16"/>';
    s += '<polygon points="' + X(be) + ',' + Y(rev(be)) + ' ' + X(mx) + ',' + Y(rev(mx)) + ' ' + X(mx) + ',' + Y(cost(mx)) + '" fill="#5be38a" opacity=".16"/>';
    s += '<line x1="' + L + '" y1="' + Y(0) + '" x2="' + (W - R) + '" y2="' + Y(0) + '" stroke="#ffffff33"/>';
    s += '<line x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + Y(0) + '" stroke="#ffffff33"/>';
    s += '<line x1="' + X(0) + '" y1="' + Y(cost(0)) + '" x2="' + X(mx) + '" y2="' + Y(cost(mx)) + '" stroke="#ff5b6b" stroke-width="3"/>';
    s += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(mx) + '" y2="' + Y(rev(mx)) + '" stroke="#f4a85c" stroke-width="3"/>';
    s += '<line x1="' + X(be) + '" y1="' + Y(rev(be)) + '" x2="' + X(be) + '" y2="' + Y(0) + '" stroke="#5be38a" stroke-dasharray="5 5"/>';
    s += '<circle cx="' + X(be) + '" cy="' + Y(rev(be)) + '" r="7" fill="#5be38a"/>';
    var ta = be / mx > .7 ? 'end' : 'middle';
    s += '<text x="' + X(be) + '" y="' + (H - 18) + '" fill="#5be38a" font-size="15" font-weight="700" text-anchor="' + ta + '">' + n0(r.beUnitsCeil) + ' ' + esc(unit()) + '</text>';
    s += '<text x="' + (L + 6) + '" y="' + (Y(cost(0)) - 8) + '" fill="#ff5b6b" font-size="13">Costs (start at ' + money(r.fixedTotal) + ')</text>';
    s += '<text x="' + (W - R) + '" y="' + (Y(rev(mx)) + 18) + '" fill="#f4a85c" font-size="13" text-anchor="end">Revenue</text>';
    s += '<text x="' + (L + 8) + '" y="' + (Y(0) - 8) + '" fill="#ff5b6b" font-size="12" opacity=".9">LOSS</text>';
    s += '<text x="' + (W - R - 8) + '" y="' + (Y(0) - 8) + '" fill="#5be38a" font-size="12" text-anchor="end" opacity=".9">PROFIT</text>';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Chart: costs and revenue cross at ' + n0(r.beUnitsCeil) + ' ' + esc(unit()) + '">' + s + '</svg>';
  }

  function render() {
    var r = BE.compute({ products: rows(), fixed: $('fixed').value, ownerPay: $('pay').value, days: $('days').value, target: $('target').value, expected: $('exp').value });
    var u = esc(unit()), h = '';
    if (r.error === 'no_products') { out.innerHTML = '<p class="err">Add a price and a variable cost to start.</p>'; return; }
    if (r.error === 'no_contribution') {
      out.innerHTML = '<p class="err">Each sale loses money.</p><p>Your variable cost (' + money(r.avgCost) + ') is as high as your price (' + money(r.avgPrice) + '). No number of sales will cover your fixed costs. Raise the price or lower the cost per sale first.</p>';
      return;
    }
    if (r.fixedTotal <= 0) { out.innerHTML = '<p class="err">Add your fixed costs to see your break-even point.</p><p>Rent, lease, loan payments, software, insurance, and your own pay if you want to take one.</p>'; return; }
    h += '<p style="margin:0;color:var(--muted)">You break even at</p>';
    h += '<div class="big">' + n0(r.beUnitsCeil) + '<small>' + u + ' per month</small></div>';
    h += '<div class="kpis">';
    h += '<div class="kpi"><b>' + n0(r.beUnitsPerDay) + '</b><span>' + u + ' per working day</span></div>';
    h += '<div class="kpi"><b>' + money(r.beRevenue) + '</b><span>in sales per month</span></div>';
    h += '<div class="kpi"><b>' + money(r.contribution) + '</b><span>contribution per sale (' + Math.round(r.contributionPct * 100) + '%)</span></div>';
    h += '<div class="kpi"><b>' + money(r.fixedTotal) + '</b><span>fixed costs' + (r.ownerPay > 0 ? ' incl. your pay' : '') + '</span></div>';
    h += '</div>';
    if (r.ownerPay > 0) h += '<div class="note bad">Without your own pay you would think you break even at <b>' + n0(r.withoutPay) + '</b> ' + u + '. The real number is <b>' + n0(r.beUnitsCeil) + '</b>.</div>';
    else h += '<div class="note">Your own pay is not in these numbers. If you want to pay yourself, add it in step 2 and watch the break-even point move.</div>';
    if (!r.mixOk) h += '<div class="note">Your product shares add up to ' + Math.round(r.shareSum) + '%. They were scaled to 100%.</div>';
    if (r.targetUnits) h += '<div class="note good">To earn <b>' + money(+$('target').value) + '</b> a month you need <b>' + n0(r.targetUnits) + '</b> ' + u + ' (' + n0(r.targetPerDay) + ' per day).</div>';
    if (r.expected) {
      if (r.profit >= 0) h += '<div class="note good">At <b>' + n0(r.expected) + '</b> ' + u + ' you earn <b>' + money(r.profit) + '</b>. You are ' + Math.round(r.marginOfSafety * 100) + '% above break-even. If sales fell 20%, profit would be <b>' + money(r.profitIfDown20) + '</b>.</div>';
      else h += '<div class="note bad">At <b>' + n0(r.expected) + '</b> ' + u + ' you lose <b>' + money(-r.profit) + '</b> a month. You are ' + n0(r.beUnitsCeil - r.expected) + ' ' + u + ' short of break-even.</div>';
    }
    h += chart(r);
    out.innerHTML = h;
  }

  DEFAULT.forEach(addRow);
  $('add').onclick = function () { if (prods.children.length < MAX) { addRow({ name: 'Product ' + (prods.children.length + 1), price: '', cost: '', share: 0 }); sync(); } };
  $('f').addEventListener('input', render);
  sync();
})();
