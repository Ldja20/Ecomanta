const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
});

async function connect() {
    if (global.connection) {
        return global.connection.connect();
    }
    
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');

    global.connection = pool;
    return pool.connect();
}

async function getUserByEmail(email) {
    const client = await connect();
    try {
        const res = await client.query("SELECT * FROM usuarios WHERE email=$1", [email]);
        return res.rows;
    } catch (err) {
        console.error('Error executing query', err);
        throw err;
    } finally {
        client.release();
    }
}

async function getUserById(id) {
    const client = await connect();
    try {
        const res = await client.query("SELECT * FROM usuarios WHERE id=$1", [id]);
        return res.rows;
    } catch (err) {
        console.error('Error executing query', err);
        throw err;
    } finally {
        client.release();
    }
}

async function insertUsers(user) {
    const client = await connect();
    try {
        const sql = "INSERT INTO usuarios (nome, sobrenome, email, senha) VALUES ($1, $2, $3, $4)";
        const values = [user.nome, user.sobrenome, user.email, user.senha];
        await client.query(sql, values);
    } finally {
        client.release();
    }
}

async function selectUser(id) {
    const client = await connect();
    const res = await client.query("SELECT * FROM usuarios WHERE id=$1", [id]);
    return res.rows;
}

async function selectUsers() {
    const client = await connect();
    const res = await client.query("SELECT * FROM usuarios");
    return res.rows;
}

module.exports = {
    getUserByEmail,
    getUserById,
    insertUsers,
    selectUser,
    selectUsers,
};
