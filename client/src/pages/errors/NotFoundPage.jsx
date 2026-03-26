import { useNavigate } from 'react-router-dom';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import { useEffect } from 'react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => { document.title = '404 Not Found — IMS Pro'; }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center animate-fadeIn relative z-10 w-full max-w-lg mx-auto" style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position:'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--accent-bright)', filter: 'blur(100px)', opacity: '0.07', zIndex: '0' }}/>
        <div className="flex flex-col items-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4" style={{ background: 'var(--accent-glow)' }}>
            <HiOutlineQuestionMarkCircle className="w-10 h-10" style={{ color: 'var(--accent-bright)' }} />
          </div>
          <h1 className="font-mono" style={{ fontSize: '80px', fontWeight: 700, color: 'var(--border-strong)', lineHeight: 1 }}>404</h1>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>Page Not Found</h2>
          <p className="mb-8 max-w-sm mt-2" style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate(-1)} className="btn-ghost">
              Go Back
            </button>
            <button onClick={() => navigate('/', { replace: true })} className="btn-primary">
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
