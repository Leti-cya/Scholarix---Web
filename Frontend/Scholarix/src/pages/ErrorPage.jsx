import React from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../component/ThemeToggle'

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--surf-page)',
      color: 'var(--surf-text)',
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <ThemeToggle style={{ position: 'fixed', top: 20, right: 20 }} />
      <span style={{ fontSize: '72px', marginBottom: '16px' }} role="img" aria-label="magnifying glass">🔍</span>
      <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px' }}>Page Not Found (404)</h1>
      <p style={{ fontSize: '16px', color: 'var(--surf-text-muted)', maxWidth: '480px', marginBottom: '24px', lineHeight: '1.6' }}>
        We couldn't find the page you were looking for. It may have been moved, deleted, or never existed in the first place.
      </p>
      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '12px 24px',
          backgroundColor: '#2563EB',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#1D4ED8'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#2563EB'}
      >
        Return to Home Page
      </button>
    </div>
  )
}

export default ErrorPage