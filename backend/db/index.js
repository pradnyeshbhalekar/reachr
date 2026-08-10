const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const migration = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        encrypted_refresh_token TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS beta_signups (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT now()
    );
`;

const ready = pool.query(migration).catch((err) => {
    console.error("[db] migration failed:", err.message);
    throw err;
});

async function getUserByGoogleId(googleId) {
    const { rows } = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
    return rows[0] || null;
}

async function getUserById(id) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] || null;
}

async function getUserByEmail(email) {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] || null;
}

async function upsertUser({ googleId, email, name, encryptedRefreshToken }) {
    const { rows } = await pool.query(
        `INSERT INTO users (google_id, email, name, encrypted_refresh_token)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (google_id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            encrypted_refresh_token = COALESCE(EXCLUDED.encrypted_refresh_token, users.encrypted_refresh_token),
            updated_at = now()
         RETURNING *`,
        [googleId, email, name, encryptedRefreshToken || null]
    );
    return rows[0];
}

async function updateRefreshToken(userId, encryptedRefreshToken) {
    const { rows } = await pool.query(
        `UPDATE users SET encrypted_refresh_token = $2, updated_at = now() WHERE id = $1 RETURNING *`,
        [userId, encryptedRefreshToken]
    );
    return rows[0];
}

async function createBetaSignup({ name, email }) {
    const { rows } = await pool.query(
        `INSERT INTO beta_signups (name, email) VALUES ($1, $2) RETURNING *`,
        [name, email]
    );
    return rows[0];
}

async function getBetaSignupById(id) {
    const { rows } = await pool.query("SELECT * FROM beta_signups WHERE id = $1", [id]);
    return rows[0] || null;
}

async function approveBetaSignup(id) {
    const { rows } = await pool.query(
        `UPDATE beta_signups SET status = 'approved' WHERE id = $1 RETURNING *`,
        [id]
    );
    return rows[0];
}

async function getAllBetaSignupsWithStatus() {
    const { rows } = await pool.query(
        `SELECT
            b.id, b.name, b.email, b.status, b.created_at,
            (u.id IS NOT NULL) AS signed_in
         FROM beta_signups b
         LEFT JOIN users u ON u.email = b.email
         ORDER BY b.created_at DESC`
    );
    return rows;
}

module.exports = {
    pool,
    ready,
    getUserByGoogleId,
    getUserById,
    getUserByEmail,
    upsertUser,
    updateRefreshToken,
    createBetaSignup,
    getBetaSignupById,
    approveBetaSignup,
    getAllBetaSignupsWithStatus,
};
