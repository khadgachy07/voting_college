import { useState, useSearchParams } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../utils/api.js';
import Input from '../components/ui/Input.jsx';
import { Button, Card } from '../components/ui/index.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/student/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      login(data.token, data.user);
      const role = data.user?.role;
      // Use returnTo if available, otherwise use role-based default
      const path = returnTo || (role === 'admin' ? '/admin/dashboard' : role === 'candidate' ? '/candidate/dashboard' : '/student/dashboard');
      navigate(path);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🗳️</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">VoteCollege</h1>
          <p className="text-sm text-slate-500">Online College Election System</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required autoFocus />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />

            <Button variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-400">
          Demo: admin@college.edu / Admin@123 · STU001@college.edu / Password123!
        </div>
        <div className="mt-3 text-center text-xs">
          New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}