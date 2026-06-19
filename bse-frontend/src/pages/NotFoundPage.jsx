import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      gap: '1.5rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        letterSpacing: '0.15em',
        color: 'var(--mist)',
        textTransform: 'uppercase',
      }}>
        404 · Page Not Found
      </p>
      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 700,
        color: 'var(--parchment)',
        lineHeight: 1.1,
      }}>
        This crop didn't sprout.
      </h1>
      <p style={{ color: 'var(--mist)', maxWidth: '360px', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: '0.5rem',
          padding: '0.65rem 1.5rem',
          background: 'var(--harvest)',
          color: 'var(--soil)',
          fontWeight: 600,
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          textDecoration: 'none',
          borderRadius: '2px',
        }}
      >
        Back to Home
      </Link>
    </main>
  );
}