import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Replace with your MongoDB collection endpoint or API base URL
// In a real app, this should be in an environment variable
const MONGO_API_URL = import.meta.env.VITE_MONGO_API_URL || '';

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
      // Logic: Search for the user by email in the MongoDB database
      // Adjust the endpoint structure according to your chosen backend/service (e.g., Atlas Data API or custom backend)
      const response = await axios.get(`${MONGO_API_URL}?email=${email}`);
      
      const user = response.data; // Assuming return is the user object or an array

      if (user && (Array.isArray(user) ? user.length > 0 : true)) {
        // Successful match found
        const userData = Array.isArray(user) ? user[0] : user;
        
        // Store user details in localStorage to display on the employee page later
        localStorage.setItem('employeeData', JSON.stringify(userData));
        
        navigate('/employee');
      } else {
        setError('Employee record not found. Please check your email.');
      }
    } catch (err) {
      console.error('Login error:', err);
      // For demo purposes if URI isn't added yet, provide a fallback or clear error
      if (MONGO_API_URL.includes('YOUR_MONGODB')) {
        setError('Database URI not configured. Please add VITE_MONGO_API_URL.');
      } else {
        setError('Failed to connect to database. Please try again.');
        console.log(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e11] text-gray-300 font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-[#1c1c21] p-4 rounded-2xl border border-white/5 shadow-2xl mb-4 group hover:border-indigo-500/30 transition-colors">
            <Zap className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">EmployeeX</h1>
          <p className="text-gray-500 mt-2 font-medium">Internal Workspace Access</p>
        </div>

        {/* Card */}
        <div className="bg-[#121214] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-black/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          
          <form onSubmit={handleSignin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full bg-[#09090b] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Security Key</label>
                <button type="button" className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#09090b] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-[#09090b] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-[0.98] transition-all relative overflow-hidden group disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Verification Badge */}
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 grayscale group-hover:grayscale-0 transition-all duration-700">
            <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Enterprise Secure Session</span>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-gray-600 text-xs mt-8 font-medium">
          Authorized personnel only. Access is monitored and logged.<br/>
          <span className="text-gray-700 mt-2 inline-block">v4.0.2-prod-secure</span>
        </p>
      </motion.div>
    </div>
  );
}
