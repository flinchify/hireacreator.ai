'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: '#fff' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#171717', marginBottom: '0.5rem' }}>Something went wrong</h1>
            <p style={{ color: '#737373', marginBottom: '1.5rem', fontSize: '0.9rem' }}>We hit an unexpected error. Try refreshing.</p>
            <button
              onClick={reset}
              style={{ padding: '0.75rem 1.5rem', background: '#171717', color: '#fff', border: 'none', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
