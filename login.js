document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('login-form');
  var msg = document.getElementById('login-msg');

  // If already logged in, skip straight to the dashboard.
  fetch('/api/session')
    .then(function (r) { return r.json(); })
    .then(function (s) { if (s.authenticated) window.location.href = 'dashboard.html'; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var password = document.getElementById('password').value;
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password })
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b }; }); })
      .then(function (result) {
        if (!result.ok) {
          msg.textContent = 'Incorrect password.';
          msg.className = 'form-msg err';
          return;
        }
        window.location.href = 'dashboard.html';
      });
  });
});
