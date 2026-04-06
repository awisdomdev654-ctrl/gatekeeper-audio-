import './App.css'

function App() {
  const stemQueue = [
    { id: 'STEM-1023', title: 'SZA Vox Lead v4', owner: 'A&R Team', status: 'Encrypted' },
    { id: 'STEM-1024', title: 'Jazmine Chorus Stack', owner: 'Producer Desk', status: 'Awaiting Review' },
    { id: 'STEM-1025', title: '808 Bounce Alt Mix', owner: 'Mix Engineer', status: 'Signed URL Active' },
  ]

  const recentActivity = [
    '10:21 AM - Producer uploaded "SZA Vox Lead v4"',
    '10:28 AM - Signed URL issued to Mix Engineer (expires in 10 mins)',
    '10:42 AM - Security scan passed on latest frontend build',
    '11:03 AM - New version tagged for "Jazmine Chorus Stack"',
  ]

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Gatekeeper Audio</p>
          <h1>Secure Stem Vault Dashboard</h1>
          <p className="subtitle">
            Frontend prototype for secure collaboration on unreleased music projects.
          </p>
        </div>
        <div className="security-pill">AES-256 at Rest - Signed URLs: 10m</div>
      </header>

      <section className="metrics-grid">
        <article className="metric-card">
          <p>Active Sessions</p>
          <h2>14</h2>
          <span>2 high-priority sessions in progress</span>
        </article>
        <article className="metric-card">
          <p>Encrypted Stems</p>
          <h2>387</h2>
          <span>All protected in secure object storage</span>
        </article>
        <article className="metric-card">
          <p>Pending Reviews</p>
          <h2>9</h2>
          <span>3 awaiting producer approval</span>
        </article>
        <article className="metric-card">
          <p>Audit Events (24h)</p>
          <h2>128</h2>
          <span>No suspicious activity detected</span>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <div className="panel-header">
            <h3>Stem Upload Queue</h3>
            <button type="button">Upload New Stem</button>
          </div>
          <ul className="stem-list">
            {stemQueue.map((stem) => (
              <li key={stem.id}>
                <div>
                  <strong>{stem.title}</strong>
                  <p>
                    {stem.id} - Owner: {stem.owner}
                  </p>
                </div>
                <span className="status">{stem.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h3>Recent Audit Activity</h3>
          <ul className="audit-list">
            {recentActivity.map((activity) => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
          <div className="panel-footer">
            <button type="button">View Full Audit Trail</button>
          </div>
        </article>
      </section>

      <section className="roadmap">
        <h3>Frontend Next Steps</h3>
        <div className="roadmap-items">
          <div>
            <strong>Auth UI</strong>
            <p>Add role-based routes for producer, engineer, and admin views.</p>
          </div>
          <div>
            <strong>Upload Flow</strong>
            <p>Connect dropzone to backend endpoint and show progress states.</p>
          </div>
          <div>
            <strong>Security UX</strong>
            <p>Display URL expiration countdown and access warnings in real time.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
