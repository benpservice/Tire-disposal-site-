// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.navtoggle');
  var links = document.querySelector('.navlinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // ---- Booking form ----
  var form = document.getElementById('pickup-form');
  if (!form) return;

  var currentInput = document.getElementById('current-tires');
  var monthlyInput = document.getElementById('monthly-tires');
  var fill = document.getElementById('meter-fill');
  var read = document.getElementById('meter-read');

  function updateMeter() {
    var current = parseInt(currentInput.value, 10) || 0;
    var monthly = parseInt(monthlyInput.value, 10) || 0;
    var total = current + monthly;
    var pct = Math.min(100, (total / 200) * 100); // 200 tires = full scale, just a visual reference
    fill.style.width = pct + '%';
    read.textContent = total > 0
      ? total + ' tires/mo in view (on hand + generated)'
      : 'enter your numbers above';
  }
  if (currentInput && monthlyInput) {
    currentInput.addEventListener('input', updateMeter);
    monthlyInput.addEventListener('input', updateMeter);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('form-msg');
    var submitBtn = form.querySelector('button[type="submit"]');

    var data = {
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
      current: currentInput.value.trim(),
      monthly: monthlyInput.value.trim(),
      date: document.getElementById('date').value.trim(),
      notes: document.getElementById('notes').value.trim()
    };

    if (!data.name || !data.phone || !data.address || !data.current) {
      msg.textContent = 'Please fill in your name, phone, address, and tire count.';
      msg.className = 'form-msg err';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch('/api/pickups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
      .then(function (result) {
        if (!result.ok) throw new Error(result.body && result.body.error ? result.body.error : 'Request failed');
        msg.textContent = "Request received — we'll confirm your pickup window shortly.";
        msg.className = 'form-msg ok';
        form.reset();
        updateMeter();
      })
      .catch(function () {
        msg.textContent = "Something went wrong sending your request. Please call or text us directly.";
        msg.className = 'form-msg err';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Pickup Request';
      });
  });
});
