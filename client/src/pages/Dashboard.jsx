import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import './Dashboard.css';

export default function Dashboard() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadQueues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/queues');
      setQueues(data.data);
    } catch (err) {
      setError('Could not load your queues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueues();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api.post('/queues', { name: newName.trim() });
      setNewName('');
      setShowForm(false);
      loadQueues();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create queue.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="container dashboard">
        <div className="dashboard__header">
          <div>
            <h1>Your queues</h1>
            <p className="dashboard__subtitle">Every counter you manage, in one place</p>
          </div>
          <button className="btn btn--primary" onClick={() => setShowForm((s) => !s)}>
            + New queue
          </button>
        </div>

        {showForm && (
          <form className="dashboard__new-form" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="e.g. Front Desk, Pharmacy Counter, Table Service"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button className="btn btn--amber" type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        )}

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p className="dashboard__loading">Loading queues…</p>
        ) : queues.length === 0 ? (
          <div className="empty-state">
            <h3>No queues yet</h3>
            <p>Create your first queue to start calling tickets.</p>
          </div>
        ) : (
          <div className="dashboard__grid">
            {queues.map((q) => (
              <Link to={`/queues/${q._id}`} key={q._id} className="queue-card">
                <div className="queue-card__ticket-mark">#</div>
                <h3 className="queue-card__name">{q.name}</h3>
                <span className="queue-card__meta">
                  Created {new Date(q.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
