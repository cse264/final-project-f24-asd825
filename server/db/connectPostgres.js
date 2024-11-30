import pg from 'pg'
const { Client } = pg
 

const client = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: {
      rejectUnauthorized: false
    }
  })


client.connect()

export const query = async (text, params) => {
    try {
        console.log("query to be executed:", text, params);
        const res = await client.query(text, params);
        return res;
    } catch (err) {
        console.error("Problem executing query");
        console.error(err);
        throw err;
    }
};

/* 
HOW TO USE
    query(qs).then(data) => {res.json(data.rows)}
*/
