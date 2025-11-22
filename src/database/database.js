import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabase("catalog.db");

// Versão atual do schema do banco
const DB_VERSION = 2;

export function initDatabase(cb) {
  db.transaction(tx => {
    // Verificar versão atual do DB no dispositivo
    tx.executeSql("PRAGMA user_version;", [], (_, result) => {
      const currentVersion = result.rows.item(0).user_version;

      if (currentVersion === 0) {
        console.log("📌 Criando tabelas pela primeira vez...");
        createTables(tx);
        tx.executeSql(`PRAGMA user_version = ${DB_VERSION}`);
      } 
      else if (currentVersion < DB_VERSION) {
        console.log(`📌 Migração de v${currentVersion} → v${DB_VERSION}`);
        runMigrations(tx, currentVersion);
      }
    });
  }, (err) => console.log("DB init error", err), cb);
}

function createTables(tx) {
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      manufacturer TEXT,
      car_model TEXT,
      car_year TEXT,
      condition TEXT,
      purchase_price REAL DEFAULT 0,
      sale_price REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      low_threshold INTEGER DEFAULT 3,
      image TEXT
    );
  `);

  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT
    );
  `);

      tx.executeSql(`CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT
    );
    `);

  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      customer_id INTEGER,
      qty INTEGER,
      price REAL,
      sale_date TEXT
    );
  `);

  // Índices para melhorar pesquisa
  tx.executeSql("CREATE INDEX IF NOT EXISTS idx_product_name ON products (name);");
  tx.executeSql("CREATE INDEX IF NOT EXISTS idx_product_sku ON products (sku);");
}

function runMigrations(tx, currentVersion) {
  if (currentVersion < 1) {
    // Migrações antigas (se um dia tiver)
    // ex: tx.executeSql("ALTER TABLE products ADD COLUMN barcode TEXT;");
  }

  if (currentVersion < 2) {
    // 🔹 Nova tabela suppliers para quem já tinha DB sem ela
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT
      );
    `);

    tx.executeSql(`PRAGMA user_version = 2`);
  }
}

export default db;