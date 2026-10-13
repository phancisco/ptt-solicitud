import * as SQLite from 'expo-sqlite';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export const getDatabaseAsync = () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('ptt.db').catch((error: unknown) => {
      databasePromise = undefined;
      throw error;
    });
  }

  return databasePromise;
};

export const initDB = async () => {
  const db = await getDatabaseAsync();

  // Crear tabla de usuarios
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      correo TEXT UNIQUE,
      password TEXT,
      rol TEXT
    );
  `);

  // Crear tabla de solicitudes CON TODAS LAS COLUMNAS desde el inicio
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS solicitudes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mecanico_id INTEGER,
      codigo TEXT,
      tipo_componente TEXT,
      cliente TEXT,
      tipo_recuperacion TEXT,
      descripcion TEXT,
      estado TEXT,
      motivo_revision TEXT,
      imagenes TEXT, 
      descripcion_original TEXT,
      imagenes_originales TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Parche de seguridad por si instalas la actualización sobre una versión antigua
  try { await db.execAsync(`ALTER TABLE solicitudes ADD COLUMN imagenes TEXT;`); } catch (e) {}
  try { await db.execAsync(`ALTER TABLE solicitudes ADD COLUMN descripcion_original TEXT;`); } catch (e) {}
  try { await db.execAsync(`ALTER TABLE solicitudes ADD COLUMN imagenes_originales TEXT;`); } catch (e) {}

  // Insertar usuarios por defecto
  try {
    await db.runAsync(`INSERT INTO usuarios (correo, password, rol) VALUES ('ejemplo@powertrain.cl', '123', 'MECANICO')`);
    await db.runAsync(`INSERT INTO usuarios (correo, password, rol) VALUES ('supervisor@powertrain.cl', '123', 'SUPERVISOR')`);
    await db.runAsync(`INSERT INTO usuarios (correo, password, rol) VALUES ('administrador@powertrain.cl', '123', 'ADMIN')`);
  } catch (e) {}

  return db;
};