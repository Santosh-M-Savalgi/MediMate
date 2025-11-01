import React from 'react';

export default function QueryTable() {
	return (
		<div className="mm-container">
			<h2 style={{color:'#fff'}}>SQL Queries</h2>
			<div className="card">
				<p className="muted">This section is a playground for SQL queries against the development database. For safety, it is disabled in the client. Use the backend `queries` route with proper auth to run queries.</p>
				<pre style={{background:'rgba(0,0,0,0.12)',padding:12,borderRadius:8,color:'#fff'}}>
-- Example schema (see schema.sql)
SELECT * FROM users LIMIT 10;
				</pre>
			</div>
		</div>
	);
}
