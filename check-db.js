import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
	connectionString: 'postgresql://postgres:password@localhost:5433/learn-coding'
});

async function check() {
	try {
		const res = await pool.query(
			"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
		);
		console.log(
			'Tables:',
			res.rows.map((r) => r.table_name)
		);

		const auth = await pool.query('SELECT * FROM device_auth LIMIT 1');
		console.log('Device Auth Table exists. Rows:', auth.rowCount);
	} catch (err) {
		console.error('Error:', err);
	} finally {
		await pool.end();
	}
}

check();
