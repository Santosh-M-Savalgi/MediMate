import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components.css';

export default function LandingPage(){
	const navigate = useNavigate();

	return (
		<main style={{ padding: 32 }}>
			<div className="landing-container">
				<div className="landing-grid">
					<div className="landing-card">
						<h2 className="card-title">Sign In / Register</h2>
						<p className="card-desc">Access your dashboard, appointments and messages. If you don't have an account, register in a few steps.</p>
						<div className="card-actions">
							<button className="btn-primary" onClick={() => navigate('/login')}>Login</button>
							<button className="btn-ghost" onClick={() => navigate('/register')}>Register</button>
						</div>
					</div>

					<div className="landing-card">
						<h2 className="card-title">Execute SQL / Developer Tools</h2>
						<p className="card-desc">Open the SQL console to view helper functions, triggers, and indexes. Intended for developers or admins.</p>
						<div className="card-actions">
							<button className="btn-primary" onClick={() => navigate('/sql-queries')}>Open SQL Tools</button>
						</div>
					</div>
				</div>

				<div style={{ marginTop: 28 }}>
					<small style={{ color: 'var(--muted)' }}>Tip: Use the SQL tools only in development or with proper DB access.</small>
				</div>
			</div>
		</main>
	)
}
