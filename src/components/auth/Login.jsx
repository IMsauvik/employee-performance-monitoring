import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/amwoodo-logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.user.role === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    let demoCredentials;
    if (role === 'admin') {
      demoCredentials = { email: 'admin@demo.com', password: 'demo123' };
    } else if (role === 'manager') {
      demoCredentials = { email: 'manager@demo.com', password: 'demo123' };
    } else {
      demoCredentials = { email: 'alice@demo.com', password: 'demo123' };
    }

    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);

    try {
      const result = await login(demoCredentials.email, demoCredentials.password);

      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.user.role === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      }
    } catch (error) {
      setError('Demo login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-fadeIn">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover-lift">
          {/* Logo and Header */}
          <div className="text-center mb-8 animate-slideIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-primary-600 rounded-2xl mb-4 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary-700 mb-2">
              <img src={logo} alt="Amwoodo Logo" className="h-8 w-auto object-contain inline-block" />
            </h1>
            <p className="text-gray-600">Performance Monitoring System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 px-4 py-3 rounded-lg text-sm animate-shake">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#ffde59]" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffde59] focus:border-transparent transition-all bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#ffde59]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffde59] focus:border-transparent transition-all bg-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#ffde59] hover:text-[#e5c751]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#ffde59] hover:text-[#e5c751]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffde59] hover:bg-[#e5c751] text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 text-gray-500 font-medium">Quick Demo Access</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="flex flex-col items-center justify-center px-3 py-3 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all group hover-lift"
              >
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-all shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager')}
                className="flex flex-col items-center justify-center px-3 py-3 border-2 border-primary-200 rounded-xl hover:bg-primary-50 hover:border-primary-400 transition-all group hover-lift"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-primary-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-all shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Manager</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('employee')}
                className="flex flex-col items-center justify-center px-3 py-3 border-2 border-green-200 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all group hover-lift"
              >
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-all shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">Employee</span>
              </button>
            </div>

            <div className="mt-6 text-center text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-1">
              <p className="font-semibold text-gray-700">Demo Credentials:</p>
              <p><span className="font-medium">Admin:</span> admin@demo.com / admin123</p>
              <p><span className="font-medium">Manager:</span> manager@demo.com / manager123</p>
              <p><span className="font-medium">Employee:</span> alice@demo.com / employee123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Secure Employee Performance Management System
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default Login;
