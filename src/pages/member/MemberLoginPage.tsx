import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FoundationLogo } from '../../components/common/FoundationLogo';
import { loginMember, isMemberAuthenticated } from '../../utils/memberAuth';
import { UserCheck, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const MemberLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (isMemberAuthenticated()) {
      navigate('/member/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await loginMember(identifier, password);
      setIsLoading(false);
      if (res.success) {
        navigate('/member/dashboard', { replace: true });
      } else {
        setError(res.error || 'Authentication failed. Please verify your Member ID or Password.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Login error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#064E3B] to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-[#064E3B] p-8 text-white text-center space-y-3 relative">
          <div className="flex justify-center">
            <FoundationLogo variant="white" size="md" />
          </div>
          <div className="space-y-1">
            <h1 className="font-serif text-xl font-bold tracking-wide text-white">
              Silah-e-Khair Member Portal
            </h1>
            <p className="font-sans text-xs text-emerald-200/90 max-w-xs mx-auto">
              Access your personal contribution ledger, register for volunteer drives, and track community points.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Member ID or Registered Phone Number
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. SKF-0001 or 03001234567"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                You can log in using either your assigned Member ID (e.g. SKF-0001) or your registered mobile number.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#047857] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span>Verifying Member Record...</span>
              ) : (
                <>
                  <span>Sign In to Member Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Return to Home Button */}
          <div className="text-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-slate-500 hover:text-[#047857] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              ← Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
