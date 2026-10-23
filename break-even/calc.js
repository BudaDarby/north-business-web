/* Break-even math. Pure functions, no DOM. Used by the page and by test.js */
(function (root) {
  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function ceil(x) { return Math.max(0, Math.ceil(x - 1e-9)) + 0; }

  function compute(inp) {
    var rows = (inp.products || []).map(function (p) {
      return { name: p.name || '', price: num(p.price), cost: num(p.cost), share: Math.max(0, num(p.share)) };
    }).filter(function (p) { return p.price > 0 || p.cost > 0; });
    if (!rows.length) return { error: 'no_products' };

    var shareSum = rows.reduce(function (s, p) { return s + p.share; }, 0);
    rows.forEach(function (p) { p.w = shareSum > 0 ? p.share / shareSum : 1 / rows.length; });

    var avgPrice = rows.reduce(function (s, p) { return s + p.w * p.price; }, 0);
    var avgCost = rows.reduce(function (s, p) { return s + p.w * p.cost; }, 0);
    var contribution = avgPrice - avgCost;

    var fixed = Math.max(0, num(inp.fixed));
    var ownerPay = Math.max(0, num(inp.ownerPay));
    var fixedTotal = fixed + ownerPay;
    var days = Math.max(1, num(inp.days) || 1);
    var target = Math.max(0, num(inp.target));
    var expected = Math.max(0, num(inp.expected));

    var out = {
      avgPrice: avgPrice, avgCost: avgCost, contribution: contribution,
      contributionPct: avgPrice > 0 ? contribution / avgPrice : 0,
      fixedTotal: fixedTotal, ownerPay: ownerPay, days: days,
      shareSum: shareSum, mixOk: rows.length < 2 || Math.abs(shareSum - 100) < 0.5
    };
    if (contribution <= 0) { out.error = 'no_contribution'; return out; }

    out.beUnits = fixedTotal / contribution;
    out.beUnitsCeil = ceil(out.beUnits);
    out.beRevenue = out.beUnits * avgPrice;
    out.beUnitsPerDay = ceil(out.beUnits / days);
    out.withoutPay = ownerPay > 0 ? ceil(fixed / contribution) : null;

    if (target > 0) {
      out.targetUnits = ceil((fixedTotal + target) / contribution);
      out.targetPerDay = ceil((fixedTotal + target) / contribution / days);
    }
    if (expected > 0) {
      out.expected = expected;
      out.profit = expected * contribution - fixedTotal;
      out.marginOfSafety = (expected - out.beUnits) / expected;
      var drop = expected * 0.8;
      out.profitIfDown20 = drop * contribution - fixedTotal;
    }
    out.maxUnits = Math.max(out.beUnits * 2, expected * 1.15, 10);
    return out;
  }
  var api = { compute: compute };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BE = api;
})(typeof window !== 'undefined' ? window : this);
