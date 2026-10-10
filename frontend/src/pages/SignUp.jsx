import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../utils/api.js';
import Input from '../components/ui/Input.jsx';
import { Button, Card } from '../components/ui/index.js';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await authApi.register(name, email, password);
        login(data.token, { id: null, name, role: 'student' });
        navigate('/student/dashboard');
      } catch (err) {
        setError(err.message || 'Sign up failed');
      } finally {
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeoutId);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🗳️</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">Join VoteCollege</h1>
          <p className="text-sm text-slate-500">Create your voter account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alice Johnson" required autoFocus />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />

            <Button variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-400">
          Already have an account? <Link to="/" className="text-primary font-medium hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
