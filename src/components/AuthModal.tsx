import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateProfile: (updated: { name: string; major: string; email: string }) => void;
  onAuthSuccess?: (user: UserProfile, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'profile' | 'login' | 'register'>('profile');
  const [name, setName] = useState(currentUser.name);
  const [major, setMajor] = useState(currentUser.major);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, major, email });
    onClose();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email, password }
        : { name, email, password, major };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      if (data.token && data.user) {
        localStorage.setItem('peerlink_jwt_token', data.token);
        if (onAuthSuccess) {
          onAuthSuccess(data.user, data.token);
        }
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-variant animate-in zoom-in-95 duration-200">
        
        {/* Modal Header & Tabs */}
        <div className="flex justify-between items-center mb-5 border-b border-surface-variant pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('profile'); setError(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'profile'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Register
            </button>
          </div>
          <button onClick={onClose} className="text-outline p-1 rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-xs flex items-center gap-2 border border-error/20">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Mode: Profile Edit */}
        {mode === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg border border-primary/30">
                {currentUser.avatar}
              </div>
              <div>
                <h3 className="font-headline-md text-sm text-on-surface font-bold">{currentUser.name}</h3>
                <p className="font-label-sm text-xs text-outline">{currentUser.major} • Class of {currentUser.gradYear}</p>
              </div>
            </div>

            <div>
              <label className="block font-label-md text-on-surface text-xs mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface text-xs mb-1 font-semibold">Major / Department</label>
              <input
                type="text"
                value={major}
                onChange={e => setMajor(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface text-xs mb-1 font-semibold">Campus Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div className="bg-surface-container-low p-3 rounded-xl flex justify-around text-center my-2 border border-outline-variant/20">
              <div>
                <p className="font-headline-md text-lg text-primary font-bold">{currentUser.uploadedFilesCount}</p>
                <p className="font-label-sm text-[10px] text-outline">Notes Shared</p>
              </div>
              <div>
                <p className="font-headline-md text-lg text-primary font-bold">{currentUser.peersHelpedCount}</p>
                <p className="font-label-sm text-[10px] text-outline">Peers Helped</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label-md text-xs hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 text-xs font-bold shadow-xs"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}

        {/* Mode: Sign In or Register */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-headline-md text-base text-on-surface font-bold">
                {mode === 'login' ? 'Welcome Back to PeerLink' : 'Create Campus Account'}
              </h3>
              <p className="font-body-sm text-xs text-outline mt-1">
                {mode === 'login' ? 'Enter your credentials to access study tools' : 'Join Stanford university peer network'}
              </p>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block font-label-md text-on-surface text-xs mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface text-xs mb-1 font-semibold">Major / Field of Study</label>
                  <input
                    type="text"
                    value={major}
                    onChange={e => setMajor(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-label-md text-on-surface text-xs mb-1 font-semibold">Campus Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@stanford.edu"
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-label-md text-on-surface text-xs mb-1 font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label-md text-xs hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 text-xs font-bold shadow-xs flex items-center gap-2"
              >
                {loading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                {mode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
