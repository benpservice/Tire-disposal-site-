document.addEventListener('DOMContentLoaded', function () {
  var listEl = document.getElementById('pickup-list');
  var emptyEl = document.getElementById('empty-state');
  var countNew = document.getElementById('count-new');
  var countScheduled = document.getElementById('count-scheduled');
  var countCompleted = document.getElementById('count-completed');
  var filterButtons = document.querySelectorAll('.filter-btn');
  var logoutBtn = document.getElementById('logout-btn');
  var currentFilter = 'all';
  var allPickups = [];

  // Guard the page — bounce to login if not authenticated.
  fetch('/api/session')
    .then(function (r) { return r.json(); })
    .then(function (s) {
      if (!s.authenticated) {
        window.location.href = 'login.html';
      } else {
        loadPickups();
      }
    });

  function loadPickups() {
    fetch('/api/pickups')
      .then(function (r) {
        if (r.status === 401) { window.location.href = 'login.html'; return []; }
        return r.json();
      })
      .then(function (data) {
        allPickups = data || [];
        render();
      });
  }

  function render() {
    var pickups = currentFilter === 'all'
      ? allPickups
      : allPickups.filter(function (p) { return p.status === currentFilter; });

    countNew.textContent = allPickups.filter(function (p) { return p.status === 'new'; }).length;
    countScheduled.textContent = allPickups.filter(function (p) { return p.status === 'scheduled'; }).length;
    countCompleted.textContent = allPickups.filter(function (p) { return p.status === 'completed'; }).length;

    listEl.innerHTML = '';
    if (pickups.length === 0) {
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';

    pickups.forEach(function (p) {
      var row = document.createElement('div');
      row.className = 'pickup-row status-' + p.status;

      var when = new Date(p.createdAt);
      var whenStr = when.toLocaleDateString() + ' ' + when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      row.innerHTML =
        '<div class="pr-main">' +
          '<div class="pr-top">' +
            '<span class="pr-name">' + escapeHtml(p.name) + '</span>' +
            '<span class="pr-badge badge-' + p.status + '">' + p.status + '</span>' +
          '</div>' +
          '<div class="pr-detail">' + escapeHtml(p.address) + (p.city ? ', ' + escapeHtml(p.city) : '') + '</div>' +
          '<div class="pr-meta">' +
            '<span>' + escapeHtml(p.phone) + '</span>' +
            (p.email ? '<span>' + escapeHtml(p.email) + '</span>' : '') +
            '<span>' + escapeHtml(String(p.current)) + ' on hand</span>' +
            (p.monthly ? '<span>' + escapeHtml(String(p.monthly)) + '/mo est.</span>' : '') +
            (p.date ? '<span>Requested date: ' + escapeHtml(p.date) + '</span>' : '') +
          '</div>' +
          (p.notes ? '<div class="pr-notes">' + escapeHtml(p.notes) + '</div>' : '') +
          '<div class="pr-submitted">Submitted ' + whenStr + '</div>' +
        '</div>' +
        '<div class="pr-actions">' +
          '<select class="status-select" data-id="' + p.id + '">' +
            '<option value="new"' + (p.status === 'new' ? ' selected' : '') + '>New</option>' +
            '<option value="scheduled"' + (p.status === 'scheduled' ? ' selected' : '') + '>Scheduled</option>' +
            '<option value="completed"' + (p.status === 'completed' ? ' selected' : '') + '>Completed</option>' +
          '</select>' +
          '<button class="btn-remove" data-id="' + p.id + '" title="Delete">Delete</button>' +
        '</div>';

      listEl.appendChild(row);
    });

    listEl.querySelectorAll('.status-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var id = sel.getAttribute('data-id');
        fetch('/api/pickups/' + id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: sel.value })
        }).then(loadPickups);
      });
    });

    listEl.querySelectorAll('.btn-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('Delete this pickup request?')) return;
        var id = btn.getAttribute('data-id');
        fetch('/api/pickups/' + id, { method: 'DELETE' }).then(loadPickups);
      });
    });
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      render();
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      fetch('/api/logout', { method: 'POST' }).then(function () {
        window.location.href = 'login.html';
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
});
