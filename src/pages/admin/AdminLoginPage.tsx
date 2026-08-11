import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FoundationLogo } from '../../components/common/FoundationLogo';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle } from 'lucide-react';
import { loginAdmin, isAdminAuthenticated } from '../../utils/adminAuth';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@silah-e-khair.org');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated on this device, automatically redirect to dashboard
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    loginAdmin(email, password).then((result) => {
      setIsSubmitting(false);

      if (result.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setErrorMessage(
          result.error === 'Invalid login credentials'
            ? 'Invalid administrator credentials. Please check your email and password.'
            : result.error || 'Unable to sign in. Please try again.'
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#047857]/15 shadow-sm">
        
        {/* Header Branding */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FoundationLogo variant="stacked" size="lg" />
          </div>
          <div className="pt-2 border-t border-emerald-900/10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#047857] text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal Access</span>
            </span>
            <p className="mt-2 text-xs text-slate-500 font-sans">
              Authorized personnel access for Silah-e-Khair Foundation
            </p>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@silah-e-khair.org"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-[#064E3B] hover:bg-[#047857] text-white font-sans font-bold text-sm rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#047857] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        {/* Back link to public site */}
        <div className="text-center pt-4 border-t border-slate-100">
          <Link to="/" className="text-xs font-medium text-slate-500 hover:text-[#047857] transition-colors">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
