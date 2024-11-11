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

//funções get ----------------------------------------------------------------------------------------
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

async function getAreaByUserId(id) {
    const client = await connect();
    try {
        const res = await client.query("SELECT * FROM areas WHERE usuario_id=$1", [id]);
        return res.rows;
    } catch (err) {
        console.error('Error executing query', err);
        throw err;
    } finally {
        client.release();
    }
}

//funçoes insert --------------------------------------------------------------------------------------
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

async function insertArea(data) {
    const client = await connect()
    try{
        const sql = "INSERT INTO areas (nome_local, area, mantas, caixas, largura, comprimento, usuario_id) VALUES ($1,$2,$3,$4,$5,$6,$7)"
        const values = [data.nome_local, data.area, data.mantas, data.caixas, data.largura, data.comprimento, data.usuario_id]
        await client.query(sql,values)
    }finally{
        client.release()
    }
}

// funções select ---------------------------------------------------------------------------------
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
    getAreaByUserId,
    insertUsers,
    insertArea,
    selectUser,
    selectUsers,
};
