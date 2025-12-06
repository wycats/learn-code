import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
	connectionString: 'postgresql://postgres:password@localhost:5433/learn-coding'
});

async function check() {
	try {
		const res = await pool.query(
			"SELECT typname FROM pg_type WHERE typname = 'device_auth_status'"
		);
		console.log('Enum exists:', res.rows.length > 0);
	} catch (err) {
		console.error('Error:', err);
	} finally {
		await pool.end();
	}
}

check();
