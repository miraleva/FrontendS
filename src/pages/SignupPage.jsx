import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  function handleSubmit(e) {
    e.preventDefault();

    // Validation: All fields required
    if (
      !formData.name.trim() ||
      !formData.lastname.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setError('All fields are required');
      return;
    }

    // Validation: Password min 6 chars
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validation: Passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    // TODO: connect to backend register endpoint
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative z-10 font-sans">
      {/* Background Video Container */}
      <div className="fixed inset-0 w-screen h-screen -z-20">
        <video
          src="/videos/background.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark Overlay */}
      <div className="fixed inset-0 w-screen h-screen bg-black/40 -z-10" />

      {/* Glassmorphism Login Container */}
      <div className="w-full max-w-[550px] bg-white/15 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl p-6 md:p-8 animate-fade-in my-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 font-display">
            Create Account
          </h1>
          <p className="text-sm md:text-base text-white/80">
            Sign up for the operations assistant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* First Name & Last Name Row */}
          <div className="flex gap-3">
            {/* First Name Input */}
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="name" className="text-s font-semibold text-white/90 uppercase tracking-wider pl-4">
                Fırst Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-5 text-white/60 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="First name"
                  className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Last Name Input */}
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="lastname" className="text-s font-semibold text-white/90 uppercase tracking-wider pl-4">
                Last Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-5 text-white/60 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  id="lastname"
                  type="text"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-s font-semibold text-white/90 uppercase tracking-wider pl-4">
              Emaıl Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-white/60 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-s font-semibold text-white/90 uppercase tracking-wider pl-4">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-white/60 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-s font-semibold text-white/90 uppercase tracking-wider pl-4">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-white/60 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-14 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 text-white/60 hover:text-white transition-colors duration-200"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-s font-semibold text-white/90 uppercase tracking-wider pl-4">
              Confırm Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-white/60 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-14 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 text-white/60 hover:text-white transition-colors duration-200"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-xs text-red-300 text-center animate-shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#F59E0B] hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-500/30 font-sans tracking-wide mt-2"
          >
            Sign Up
          </button>
        </form>

        {/* Bottom Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/60">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#F59E0B] hover:text-amber-400 font-semibold hover:underline transition-colors duration-200"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
