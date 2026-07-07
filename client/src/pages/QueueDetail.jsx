import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import TicketStub from '../components/TicketStub';
import StatCard, { formatSeconds } from '../components/StatCard';
import TrendChart from '../components/TrendChart';
import './QueueDetail.css';

export default function QueueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [queueRes, tokensRes, analyticsRes] = await Promise.all([
        api.get(`/queues/${id}`),
        api.get(`/tokens/${id}`),
        api.get(`/queues/${id}/analytics`),
      ]);
      setQueue(queueRes.data.data);
      setTokens(tokensRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      setError('Could not load this queue.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const waiting = tokens.filter((t) => t.status === 'waiting');
  const serving = tokens.find((t) => t.status === 'serving');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setAdding(true);
    setError('');
    try {
      await api.post(`/tokens/${id}`, { personName: addName.trim() });
      setAddName('');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add ticket.');
    } finally {
      setAdding(false);
    }
  };

  const handleAssignNext = async () => {
    setAssigning(true);
    setError('');
    try {
      await api.put(`/tokens/${id}/assign-next`);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'No one is waiting.');
    } finally {
      setAssigning(false);
    }
  };

  const handleMove = async (token, direction) => {
    try {
      await api.put(`/tokens/${token._id}/move`, { direction });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not move ticket.');
    }
  };

  const handleComplete = async (token) => {
    try {
      await api.put(`/tokens/${token._id}/complete`);
      loadAll();
    } catch (err) {
      setError('Could not mark ticket as served.');
    }
  };

  const handleCancel = async (token) => {
    if (!window.confirm(`Cancel ${token.personName}'s ticket?`)) return;
    try {
      await api.delete(`/tokens/${token._id}`);
      loadAll();
    } catch (err) {
      setError('Could not cancel ticket.');
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="container">
          <p className="dashboard__loading">Loading queue…</p>
        </main>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="container">
          <div className="empty-state">
            <h3>Queue not found</h3>
            <Link to="/">Back to dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="container queue-detail">
        <Link to="/" className="queue-detail__back">
          ← All queues
        </Link>

        <div className="queue-detail__header">
          <h1>{queue.name}</h1>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Now-serving board */}
        <div className="serving-board">
          <div className="serving-board__display">
            <span className="serving-board__label">Now serving</span>
            <span className="serving-board__number">
              {serving ? String(serving.position).padStart(3, '0') : '—'}
            </span>
            <span className="serving-board__name">{serving ? serving.personName : 'No one currently'}</span>
          </div>
          <button
            className="btn btn--amber serving-board__cta"
            onClick={handleAssignNext}
            disabled={assigning || waiting.length === 0 || !!serving}
          >
            {serving ? 'Serving in progress' : assigning ? 'Calling…' : 'Call next ticket'}
          </button>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="queue-detail__stats">
            <StatCard label="Waiting now" value={analytics.currentQueueLength} accent="amber" />
            <StatCard label="Served all-time" value={analytics.totalServedAllTime} accent="teal" />
            <StatCard label="Avg. wait time" value={formatSeconds(analytics.avgWaitTimeSeconds)} />
            <StatCard label="Avg. service time" value={formatSeconds(analytics.avgServiceTimeSeconds)} />
          </div>
        )}

        {analytics && <TrendChart data={analytics.last7DaysTrend} />}

        {/* Add ticket */}
        <form className="add-ticket-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Add a name to the queue"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
          />
          <button className="btn btn--primary" type="submit" disabled={adding}>
            {adding ? 'Adding…' : 'Add ticket'}
          </button>
        </form>

        {/* Ticket list */}
        <div className="ticket-list">
          {tokens.length === 0 ? (
            <div className="empty-state">
              <h3>No tickets yet</h3>
              <p>Add the first person to get this queue moving.</p>
            </div>
          ) : (
            tokens
              .filter((t) => t.status !== 'served')
              .map((t, i, arr) => (
                <TicketStub
                  key={t._id}
                  token={t}
                  onMoveUp={(tok) => handleMove(tok, 'up')}
                  onMoveDown={(tok) => handleMove(tok, 'down')}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                  isFirst={i === 0}
                  isLast={i === arr.length - 1}
                />
              ))
          )}
        </div>
      </main>
    </div>
  );
}
