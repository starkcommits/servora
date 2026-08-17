import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFrappeAuth, useFrappePostCall } from 'frappe-react-sdk';
import { useQueryClient } from '@tanstack/react-query';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, currentUser } = useFrappeAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const getRedirectUrl = () => {
    const rawTarget = (location.state as any)?.from?.pathname || '/';
    if (window.location.pathname.startsWith('/frontend')) {
      return rawTarget.startsWith('/frontend') ? rawTarget : ('/frontend' + (rawTarget === '/' ? '' : rawTarget));
    }
    return rawTarget;
  };

  // Mode: 'signin' | 'signup'
  const isInitialSignUp = location.pathname === '/signup' || (location.state as any)?.mode === 'signup';
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(isInitialSignUp ? 'signup' : 'signin');

  // Sign In state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [isSignInLoading, setIsSignInLoading] = useState(false);

  // Sign Up Multi-Step state: 1 (Mobile & Name) -> 2 (OTP) -> 3 (Set Password)
  const [signUpStep, setSignUpStep] = useState<1 | 2 | 3>(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // API hooks
  const { call: sendOtpCall } = useFrappePostCall('servora.api.send_signup_otp');
  const { call: verifyOtpCall } = useFrappePostCall('servora.api.verify_signup_otp');
  const { call: completeSignupCall } = useFrappePostCall('servora.api.complete_signup');
  const { call: resolveUserCall } = useFrappePostCall('servora.api.resolve_login_user');

  // OTP inputs refs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (currentUser && currentUser !== 'Guest') {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  // Resend OTP Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (signUpStep === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [signUpStep, resendTimer]);

  // Handle Sign In submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInIdentifier.trim() || !signInPassword.trim()) {
      setErrorMsg('Please enter your email or mobile and password.');
      return;
    }

    try {
      setIsSignInLoading(true);
      setErrorMsg(null);

      // Resolve identifier if user typed a phone number
      let resolvedUsername = signInIdentifier.trim();
      const res = await resolveUserCall({ identifier: resolvedUsername });
      if (res?.message?.username) {
        resolvedUsername = res.message.username;
      }

      await login({ username: resolvedUsername, password: signInPassword });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      window.location.href = getRedirectUrl();
    } catch {
      setErrorMsg('Incorrect email/mobile or password. Please try again.');
    } finally {
      setIsSignInLoading(false);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setIsSignUpLoading(true);
      setErrorMsg(null);
      const res = await sendOtpCall({ mobile_number: cleanMobile });
      if (res?.message?.status === 'success') {
        setSuccessMsg(`OTP sent to +91 ${cleanMobile} (Demo OTP: 123456)`);
        setSignUpStep(2);
        setResendTimer(30);
        setOtpValues(['', '', '', '', '', '']);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setErrorMsg('Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error sending OTP.');
    } finally {
      setIsSignUpLoading(false);
    }
  };

  // Handle OTP digit entry
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const updated = [...otpValues];
      updated[index] = '';
      setOtpValues(updated);
      return;
    }

    const updated = [...otpValues];
    // If pasted full 6 digits
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (i < 6) updated[i] = d;
      });
      setOtpValues(updated);
      const nextFocus = Math.min(digits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    updated[index] = cleanVal;
    setOtpValues(updated);

    if (index < 5 && cleanVal) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    const enteredOtp = otpValues.join('');

    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP.');
      return;
    }

    try {
      setIsSignUpLoading(true);
      setErrorMsg(null);
      const res = await verifyOtpCall({ mobile_number: cleanMobile, otp: enteredOtp });
      if (res?.message?.status === 'success') {
        setSuccessMsg('Mobile number verified! Now set your account password.');
        setSignUpStep(3);
      } else {
        setErrorMsg('Invalid OTP. Please check and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid OTP.');
    } finally {
      setIsSignUpLoading(false);
    }
  };

  // Step 3: Set Password and Complete Signup
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    const enteredOtp = otpValues.join('') || '123456';

    try {
      setIsSignUpLoading(true);
      setErrorMsg(null);
      const res = await completeSignupCall({
        mobile_number: cleanMobile,
        otp: enteredOtp,
        password: newPassword,
        first_name: firstName.trim() || 'Customer',
        last_name: lastName.trim() || '',
      });

      if (res?.message?.status === 'success') {
        try {
          await login({ username: res.message.user || cleanMobile, password: newPassword });
        } catch (loginErr) {
          console.warn('Frontend SDK login sync:', loginErr);
        }
        await queryClient.invalidateQueries({ queryKey: ['profile'] });
        await queryClient.invalidateQueries({ queryKey: ['cart'] });
        window.location.href = getRedirectUrl();
      } else {
        setErrorMsg('Failed to complete registration. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed.');
    } finally {
      setIsSignUpLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Customer', user: '9876543210', pass: 'admin' },
    { label: 'Admin', user: 'admin@gmail.com', pass: 'admin' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="text-white text-base font-black">S</span>
          </div>
          <h1 className="text-[22px] font-extrabold text-[#1C1C1C] tracking-tight">
            {authMode === 'signin' ? 'Sign in to Servora' : 'Create your Servora account'}
          </h1>
          <p className="text-[13px] text-[#737373] mt-1">
            {authMode === 'signin'
              ? 'Book verified home services at your doorstep'
              : 'Sign up with your mobile number in seconds'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#F5F5F5] rounded-2xl border border-[#E8E8E8] mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 text-[13px] font-bold rounded-xl transition-all ${
              authMode === 'signin'
                ? 'bg-white text-[#1C1C1C] shadow-sm'
                : 'text-[#737373] hover:text-[#1C1C1C]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 text-[13px] font-bold rounded-xl transition-all ${
              authMode === 'signup'
                ? 'bg-white text-[#1C1C1C] shadow-sm'
                : 'text-[#737373] hover:text-[#1C1C1C]'
            }`}
          >
            New User (Sign Up)
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[13px] text-[#DC2626] mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-[13px] text-[#065F46] mb-5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ─── AUTH MODE: SIGN IN ─── */}
        {authMode === 'signin' ? (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#1C1C1C] mb-1.5">
                Mobile Number or Email
              </label>
              <input
                type="text"
                value={signInIdentifier}
                onChange={(e) => setSignInIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or user@servio.com"
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-[14px] text-[#1C1C1C] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#1C1C1C] bg-white transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-[#1C1C1C]">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-3 pr-10 border border-[#E8E8E8] rounded-xl text-[14px] text-[#1C1C1C] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#1C1C1C] bg-white transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#1C1C1C]"
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSignInLoading}
              className="w-full h-12 bg-[#1C1C1C] hover:bg-[#333333] text-white text-[14px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
            >
              {isSignInLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ─── AUTH MODE: SIGN UP (3-STEP JOURNEY) ─── */
          <div className="space-y-5">
            {/* Step Indicators */}
            <div className="flex items-center justify-between px-2 pb-2">
              {[
                { step: 1, label: 'Mobile' },
                { step: 2, label: 'Verify OTP' },
                { step: 3, label: 'Set Password' },
              ].map((s, idx) => (
                <React.Fragment key={s.step}>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        signUpStep === s.step
                          ? 'bg-[#1C1C1C] text-white'
                          : signUpStep > s.step
                          ? 'bg-[#059669] text-white'
                          : 'bg-[#F0F0F0] text-[#737373]'
                      }`}
                    >
                      {signUpStep > s.step ? '✓' : s.step}
                    </div>
                    <span
                      className={`text-[12px] font-semibold ${
                        signUpStep === s.step ? 'text-[#1C1C1C]' : 'text-[#737373]'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < 2 && <div className="flex-1 h-[1px] bg-[#E8E8E8] mx-2" />}
                </React.Fragment>
              ))}
            </div>

            {/* STEP 1: MOBILE NUMBER & NAME */}
            {signUpStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#1C1C1C] mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Rahul"
                      className="w-full px-3.5 py-2.5 border border-[#E8E8E8] rounded-xl text-[14px] text-[#1C1C1C] focus:outline-none focus:border-[#1C1C1C]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#1C1C1C] mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      className="w-full px-3.5 py-2.5 border border-[#E8E8E8] rounded-xl text-[14px] text-[#1C1C1C] focus:outline-none focus:border-[#1C1C1C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1C1C1C] mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex rounded-xl border border-[#E8E8E8] focus-within:border-[#1C1C1C] overflow-hidden bg-white">
                    <div className="px-3.5 py-3 bg-[#F9F9F9] border-r border-[#E8E8E8] flex items-center gap-1.5 text-[13px] font-bold text-[#1C1C1C] shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-3 text-[14px] text-[#1C1C1C] placeholder:text-[#A0A0A0] focus:outline-none"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-[#737373] mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                    <span>We will send a 6-digit verification code (Fixed OTP: 123456)</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSignUpLoading || mobileNumber.length < 10}
                  className="w-full h-12 bg-[#1C1C1C] hover:bg-[#333333] text-white text-[14px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
                >
                  {isSignUpLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Verification OTP <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: ENTER OTP */}
            {signUpStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="bg-[#FAFAFA] border border-[#E8E8E8] p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#1C1C1C]" />
                    <span className="text-[13px] font-bold text-[#1C1C1C]">
                      +91 {mobileNumber.slice(0, 5)} {mobileNumber.slice(5)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSignUpStep(1)}
                    className="text-[12px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1C1C1C] mb-2 text-center">
                    Enter 6-digit verification code
                  </label>
                  <div className="flex justify-center gap-2">
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-[18px] font-bold border border-[#E8E8E8] rounded-xl focus:outline-none focus:border-[#1C1C1C] bg-white transition-all shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[12px] px-1">
                  <span className="text-[#737373]">Demo OTP: <strong>123456</strong></span>
                  {resendTimer > 0 ? (
                    <span className="text-[#737373]">Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="font-bold text-[#1C1C1C] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSignUpLoading || otpValues.join('').length < 6}
                  className="w-full h-12 bg-[#1C1C1C] hover:bg-[#333333] text-white text-[14px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
                >
                  {isSignUpLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify OTP <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: SET PASSWORD */}
            {signUpStep === 3 && (
              <form onSubmit={handleCompleteSignup} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1C1C1C] mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 pr-10 border border-[#E8E8E8] rounded-xl text-[14px] text-[#1C1C1C] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#1C1C1C] bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#1C1C1C]"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1C1C1C] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-[14px] text-[#1C1C1C] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#1C1C1C] bg-white"
                    required
                  />
                </div>

                <div className="p-3 bg-[#F9F9F9] border border-[#E8E8E8] rounded-xl text-[12px] text-[#525252] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>You can use your mobile + this password to log in anytime.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSignUpLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full h-12 bg-[#059669] hover:bg-[#047857] text-white text-[14px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
                >
                  {isSignUpLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Signup & Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Demo Login Shortcuts */}
        <div className="mt-8 pt-6 border-t border-[#F0F0F0]">
          <p className="text-[12px] text-center text-[#737373] mb-3">Quick demo login</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setSignInIdentifier(acc.user);
                  setSignInPassword(acc.pass);
                }}
                className="py-2.5 px-3 border border-[#E8E8E8] hover:border-[#1C1C1C] rounded-xl text-[12px] font-semibold text-[#525252] hover:text-[#1C1C1C] hover:bg-[#FAFAFA] transition-colors text-center"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
