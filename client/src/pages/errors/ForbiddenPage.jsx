import { useNavigate } from 'react-router-dom';
import { HiOutlineShieldExclamation } from 'react-icons/hi2';
import { useEffect } from 'react';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  useEffect(() => { document.title = '403 Forbidden — IMS Pro'; }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center animate-fadeIn relative z-10 w-full max-w-lg mx-auto" style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position:'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--danger-text)', filter: 'blur(100px)', opacity: '0.07', zIndex: '0' }}/>
        <div className="flex flex-col items-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4" style={{ background: 'var(--danger-bg)' }}>
            <HiOutlineShieldExclamation className="w-10 h-10" style={{ color: 'var(--danger-text)' }} />
          </div>
          <h1 className="font-mono" style={{ fontSize: '80px', fontWeight: 700, color: 'var(--border-strong)', lineHeight: 1 }}>403</h1>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>Access Denied</h2>
          <p className="mb-8 max-w-sm mt-2" style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            You don't have permission to access this page. Contact your administrator if you believe this is an error.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate(-1)} className="btn-ghost">
              Go Back
            </button>
            <button onClick={() => navigate('/', { replace: true })} className="btn-primary">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
