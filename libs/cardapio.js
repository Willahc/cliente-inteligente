/* Carrinho do cardápio público (/loja/<slug>). Externo (não inline) para respeitar
   a CSP estrita do /loja: script-src cai em default-src 'self', que permite este
   arquivo same-origin mas bloqueia inline. Lê os produtos do DOM (data-*), monta o
   pedido e abre o WhatsApp do lojista. Zero dependências. */
(function () {
  function fmt(n) { return 'R$ ' + n.toFixed(2).replace('.', ','); }
  var cart = {};
  function rows() { return document.querySelectorAll('.prod[data-nome]'); }
  function recalc() {
    var n = 0, tot = 0;
    rows().forEach(function (row) {
      var nome = row.getAttribute('data-nome');
      var preco = parseFloat(row.getAttribute('data-preco')) || 0;
      var q = cart[nome] || 0; n += q; tot += q * preco;
      var qd = row.querySelector('.qd'); if (qd) qd.textContent = q;
      row.classList.toggle('on', q > 0);
    });
    var bar = document.getElementById('cartbar');
    if (bar) bar.classList.toggle('show', n > 0);
    var cn = document.getElementById('cart-n'); if (cn) cn.textContent = n;
    var ct = document.getElementById('cart-tot'); if (ct) ct.textContent = fmt(tot);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-step]'); if (!b) return;
    var nome = b.getAttribute('data-nome');
    cart[nome] = Math.max(0, (cart[nome] || 0) + parseInt(b.getAttribute('data-step'), 10));
    recalc();
  });
  var go = document.getElementById('cart-go');
  if (go) go.addEventListener('click', function () {
    var loja = document.body.getAttribute('data-loja') || '';
    var fone = document.body.getAttribute('data-wpp') || '';
    var linhas = [], tot = 0;
    rows().forEach(function (row) {
      var nome = row.getAttribute('data-nome');
      var preco = parseFloat(row.getAttribute('data-preco')) || 0;
      var q = cart[nome] || 0;
      if (q > 0) { linhas.push(q + 'x ' + nome + ' (' + fmt(q * preco) + ')'); tot += q * preco; }
    });
    if (!linhas.length || !fone) return;
    var msg = 'Olá ' + loja + '! Quero fazer um pedido:\n\n' + linhas.join('\n') + '\n\n*Total: ' + fmt(tot) + '*';
    window.open('https://wa.me/' + fone + '?text=' + encodeURIComponent(msg), '_blank');
  });
  recalc();
})();
