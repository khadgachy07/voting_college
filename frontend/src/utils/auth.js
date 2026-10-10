import { handleError } from './api.js';

export async function login(email, password) {
  const { authApi } = await import('./api.js');
  try {
    const { data } = await authApi.login(email, password);
    return data;
  } catch (err) {
    throw new Error(err.message || 'Login failed');
  }
}

export async function register(name, email, password, confirmPassword) {
  const { authApi } = await import('./api.js');
  try {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    const { data } = await authApi.register(name, email, password);
    return data;
  } catch (err) {
    throw new Error(err.message || 'Registration failed');
  }
}
