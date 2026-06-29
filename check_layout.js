const sqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join('C:\\Users\\Khai\\.gemini\\antigravity\\scratch\\vinfast-spa-backend', '.tmp', 'data.db');
const db = new sqlite3(dbPath);

try {
  // Tìm tất cả các cấu hình liên quan đến car-model
  const rows = db.prepare("SELECT key, value FROM strapi_core_store_settings WHERE key LIKE '%car-model%'").all();
  console.log('Found rows:', rows.map(r => r.key));
  
  for (const row of rows) {
    if (row.key.includes('configuration')) {
      const config = JSON.parse(row.value);
      console.log('Current layout:', JSON.stringify(config.layouts.edit, null, 2));
    }
  }
} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
