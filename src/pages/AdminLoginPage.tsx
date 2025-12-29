import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { Lock } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

export function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdmin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    
    if (success) {
      onLoginSuccess();
    } else {
      setError('Incorrect email or password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-forest-700] to-[--color-sage-700] flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[--color-sage-100] rounded-full flex items-center justify-center">
            <Lock className="text-[--color-forest-700]" size={32} />
          </div>
        </div>
        
        <h1 className="text-center mb-2">Admin Access</h1>
        <p className="text-center text-[--color-stone-600] mb-8">
          Enter your credentials to continue
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm mb-2 text-[--color-stone-700]">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
              placeholder="Enter email"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm mb-2 text-[--color-stone-700]">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600]"
              placeholder="Enter password"
            />
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-[#1B4D2E] text-white rounded-lg hover:bg-[#143622] transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}