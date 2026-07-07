const STATUS_LABEL = {
  waiting: 'Waiting',
  serving: 'Serving',
  served: 'Served',
};

function formatElapsed(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export default function TicketStub({
  token,
  onMoveUp,
  onMoveDown,
  onAssign,
  onComplete,
  onCancel,
  isFirst,
  isLast,
}) {
  const { position, personName, status, createdAt } = token;

  return (
    <div className="ticket">
      <div className="ticket__body">
        <div className="ticket__number">{String(position).padStart(3, '0')}</div>

        <div className="ticket__main">
          <p className="ticket__name">{personName}</p>
          <span className="ticket__meta">joined {formatElapsed(createdAt)}</span>
        </div>

        <span className={`ticket__status ticket__status--${status}`}>
          {STATUS_LABEL[status]}
        </span>

        <div className="ticket__actions">
          {status === 'waiting' && (
            <>
              <button
                className="icon-btn"
                onClick={() => onMoveUp(token)}
                disabled={isFirst}
                aria-label="Move up in queue"
                title="Move up"
              >
                ↑
              </button>
              <button
                className="icon-btn"
                onClick={() => onMoveDown(token)}
                disabled={isLast}
                aria-label="Move down in queue"
                title="Move down"
              >
                ↓
              </button>
            </>
          )}

          {status === 'serving' && (
            <button className="btn btn--amber" onClick={() => onComplete(token)}>
              Mark served
            </button>
          )}

          {status === 'waiting' && (
            <button
              className="icon-btn icon-btn--danger"
              onClick={() => onCancel(token)}
              aria-label="Cancel ticket"
              title="Cancel"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
