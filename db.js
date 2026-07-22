const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'pickups.json');

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}

function readAll() {
  ensure();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeAll(list) {
  ensure();
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

function insert(fields) {
  const list = readAll();
  const pickup = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    status: 'new', // new -> scheduled -> completed
    createdAt: new Date().toISOString(),
    ...fields
  };
  list.unshift(pickup);
  writeAll(list);
  return pickup;
}

function all() {
  return readAll();
}

function update(id, fields) {
  const list = readAll();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...fields };
  writeAll(list);
  return list[idx];
}

function remove(id) {
  const list = readAll().filter((p) => p.id !== id);
  writeAll(list);
}

module.exports = { insert, all, update, remove };
