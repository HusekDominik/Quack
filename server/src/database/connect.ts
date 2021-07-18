import { Pool } from 'pg';

const pool = new Pool({
	user: 'postgres',
	password: process.env.DB_PASSWORD,
	host: 'localhost',
	port: 5432,
	database: 'quack'
});

export = pool;
