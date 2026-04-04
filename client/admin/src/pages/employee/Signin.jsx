import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ✅ Backend login API (NOT MongoDB URI)
const API_URL = "http://localhost:5000/api/login";

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ✅ Call backend API
      const response = await axios.post(API_URL, {
        email,
        password
      });

      const userData = response.data.user;

      // ✅ Store user in localStorage
      localStorage.setItem('employeeData', JSON.stringify(userData));

      console.log("login successful",userData);

      // ✅ Redirect
      navigate('/employee');

    } catch (err) {
      console.error('Login error:', err);

      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError('Server not reachable');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e11] text-gray-300 font-sans flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-[#1c1c21] p-4 rounded-2xl border border-white/5 shadow-2xl mb-4">
            <Zap className="w-8 h-8 text-indigo-400" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-white">EmployeeX</h1>
          <p className="text-gray-500 mt-2">Internal Workspace Access</p>
        </div>

        {/* Card */}
        <div className="bg-[#121214] border border-white/5 rounded-[32px] p-8 shadow-2xl">

          <form onSubmit={handleSignin} className="space-y-6">

            {/* Email */}
            <div>
              <label className="text-xs text-gray-500">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white"
                  placeholder="alex@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-600 text-xs">
            <ShieldCheck className="w-4 h-4" />
            Secure Session
          </div>
        </div>
      </motion.div>
    </div>
  );
}