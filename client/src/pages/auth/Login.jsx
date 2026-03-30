import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validateEmail';
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineFingerPrint } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState({ text: '', answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { document.title = 'Authentication — IMS Pro'; }, []);

  useEffect(() => {
    if (user) {
      const intended = location.state?.from || '/';
      navigate(intended, { replace: true });
    }
    const lockUntil = sessionStorage.getItem('login_locked');
    if (lockUntil && Date.now() < parseInt(lockUntil, 10)) {
       setLocked(true);
    }
  }, [user, navigate, location.state]);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ text: `What is ${a} + ${b}?`, answer: a + b });
    setCaptchaInput('');
  };

  const handleFailure = () => {
    const attempts = parseInt(sessionStorage.getItem('login_attempts') || '0', 10) + 1;
    sessionStorage.setItem('login_attempts', attempts);
    if (attempts >= 5) {
      const lockUntil = Date.now() + (15 * 60 * 1000);
      sessionStorage.setItem('login_locked', lockUntil);
      toast.error('Too many attempts. Locked for 15 minutes.');
      setLocked(true);
    } else if (attempts >= 3) {
      setCaptchaRequired(true);
      if (!captchaQuestion.text) generateCaptcha();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || locked) return;
    
    // Validate email before submitting
    const emailRes = validateEmail(email.trim());
    if (!emailRes.valid) {
      setEmailError(emailRes.message);
      return;
    }
    
    if (captchaRequired) {
      if (parseInt(captchaInput, 10) !== captchaQuestion.answer) {
        toast.error('Incorrect CAPTCHA answer');
        generateCaptcha();
        return;
      }
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      sessionStorage.removeItem('login_attempts');
      setPassword('');
      // Wait a tiny bit for effect
      setTimeout(() => {
         toast.success('Authentication successful');
         const intended = location.state?.from || '/';
         navigate(intended, { replace: true });
      }, 400);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
      setPassword('');
      handleFailure();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, var(--accent-deep) 0%, transparent 50%), radial-gradient(circle at 90% 80%, var(--accent-deep) 0%, transparent 50%)' }}></div>
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-overlay)]"></div>
             <HiOutlineFingerPrint className="relative z-10 w-8 h-8 text-[var(--accent-bright)]" />
          </div>
          <h1 className="font-bold tracking-tight text-white mb-1" style={{ fontSize: '28px' }}>IMS Pro</h1>
          <div className="inline-flex items-center">
            <span className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] uppercase" style={{ letterSpacing: '0.1em' }}>
              V2.4 SECURE GATEWAY
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl p-8 shadow-2xl animate-fadeIn space-y-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }} id="login-form">
          <div>
            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Operator Identity</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) {
                  const res = validateEmail(e.target.value);
                  if (res.valid || e.target.value === '') setEmailError('');
                }
              }}
              onBlur={() => {
                if (email) {
                  const res = validateEmail(email);
                  if (!res.valid) setEmailError(res.message);
                }
              }}
              required
              className="w-full bg-[var(--bg-elevated)] border focus:border-[var(--accent-bright)] text-white px-4 py-3 rounded-lg outline-none transition font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: emailError ? 'var(--danger-text)' : 'var(--border-subtle)' }}
              placeholder="Enter email address"
              id="login-email"
              autoComplete="email"
              maxLength={254}
              disabled={locked}
            />
            {emailError && <p className="text-[11px] text-[var(--danger-text)] mt-2 font-medium">{emailError}</p>}
          </div>

          <div>
             <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Access Code</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-bright)] text-white pl-4 pr-10 py-3 rounded-lg outline-none transition font-mono text-lg tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                id="login-password"
                autoComplete="current-password"
                maxLength={128}
                disabled={locked}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-white transition">
                {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-[10px] font-bold text-[var(--text-muted)] hover:text-white uppercase tracking-wider transition">
                Forgot Password?
              </Link>
            </div>
          </div>

          {captchaRequired && !locked && (
            <div>
              <label className="text-[11px] font-bold text-[var(--danger-text)] uppercase tracking-wider mb-2 block">Security Check: {captchaQuestion.text}</label>
              <input
                type="number"
                value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value)}
                required
                className="w-full bg-[var(--bg-elevated)] border border-[var(--danger-border)] focus:border-[var(--danger-text)] text-white px-4 py-3 rounded-lg outline-none transition font-mono text-sm"
                placeholder="Enter answer"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || locked}
            className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-xs font-bold uppercase tracking-widest text-white transition rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: locked ? 'var(--bg-elevated)' : 'linear-gradient(to right, #2563eb, #1d4ed8)', boxShadow: locked ? 'none' : '0 4px 14px 0 rgba(37, 99, 235, 0.39)' }}
            id="login-submit"
          >
            {locked ? 'Terminal Locked' : loading ? <><LoadingSpinner size="sm" /> Authenticating...</> : 'Initiate Session'}
          </button>

          {/* Demo credentials */}
          <div className="mt-8 pt-6 border-t border-[var(--border-faint)] space-y-2">
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-3">AUTHORIZED DEMO PROFILES</p>
            <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-faint)] space-y-2">
               <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-white">Admin / Operator</span>
                 <span className="text-[10px] font-mono text-[var(--text-secondary)]">admin@ims.com</span>
               </div>
               <div className="flex justify-between items-center border-t border-[var(--border-faint)] pt-2">
                 <span className="text-xs font-bold text-white">Logistics (1 Node)</span>
                 <span className="text-[10px] font-mono text-[var(--text-secondary)]">priya@ims.com</span>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
