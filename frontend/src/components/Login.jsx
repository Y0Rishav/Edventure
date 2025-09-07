// function Login() {
//   const handleLogin = () => {
//     window.location.href = 'http://localhost:5000/auth/google';
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded shadow-md">
//         <h1 className="text-2xl mb-4">Login to Gamified Learning Platform</h1>
//         <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">Login with Google</button>
//       </div>
//     </div>
//   );
// }

// export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ColoredGoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LockIcon = () => (
    <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 16C7.46957 16 6.96086 15.7893 6.58579 15.4142C6.21071 15.0391 6 14.5304 6 14C6 12.89 6.89 12 8 12C8.53043 12 9.03914 12.2107 9.41421 12.5858C9.78929 12.9609 10 13.4696 10 14C10 14.5304 9.78929 15.0391 9.41421 15.4142C9.03914 15.7893 8.53043 16 8 16ZM14 19V9H2V19H14ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 7.89 0.89 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z" fill="#002732"/>
    </svg>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleTraditionalLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen w-full bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(20,78,94,1)_100%)] relative overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Background decorative circles */}
      <div className="absolute top-0 left-0 w-full h-full hidden sm:block">
        <div className="absolute top-[18%] left-[calc(50%+170px)] w-[132px] h-[132px] border-2 border-[#9BE9FD]/80 rounded-full opacity-30"></div>
        <div className="absolute top-[45%] left-[calc(50%-350px)] w-[132px] h-[132px] border-2 border-[#9BE9FD]/80 rounded-full opacity-30"></div>
        <div className="absolute bottom-[12%] left-[calc(50%+200px)] w-[132px] h-[132px] border-2 border-[#9BE9FD]/80 rounded-full opacity-30"></div>
      </div>
      
      <div className="flex flex-col items-center z-10">
        {/* Top Navigation */}
        <div className="flex items-center justify-center p-1.5 rounded-full bg-[#002732] border border-gray-700 mb-8">
          <button className="px-6 sm:px-10 py-2.5 text-base sm:text-lg font-bold text-white bg-[#144F5F] rounded-l-full rounded-r-full">
            Login   |   Register
          </button>
          
        </div>

        {/* Login Form Container */}
        <div className="relative">
          <div className="absolute -top-1 -left-4 w-full sm:w-[480px] h-auto sm:h-[550px] bg-white/90 rounded-[50px]"></div>
          
          <div className="relative w-full sm:w-[480px] h-auto sm:h-[550px] bg-[#001318] rounded-[50px] p-6 sm:p-10 flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#9AE9FD] text-center mb-8">
              Edventure
            </h1>

            <form className="flex flex-col w-full gap-y-4 sm:gap-y-5" onSubmit={handleTraditionalLogin}>
              {/* Username Input */}
              <div>
                <label className="text-white text-base sm:text-lg mb-2 block">Email</label>
                <input 
                  type="text" 
                  placeholder="testuser@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 sm:h-11 bg-[#C4C4C4] px-4 text-black text-base sm:text-lg border-none outline-none rounded-md"
                  required
                />
              </div>

              {/* Password Input & Forgot Password Link */}
              <div>
                <div className="relative">
                    <label className="text-white text-base sm:text-lg mb-2 block">Password</label>
                    <input 
                    type="password" 
                    placeholder="password123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 sm:h-11 bg-[#C4C4C4] pl-4 pr-10 text-black text-base sm:text-lg border-none outline-none rounded-md"
                    required
                    />
                    <div className="absolute right-4 top-[38px] sm:top-[44px] text-gray-600">
                    <LockIcon />
                    </div>
                </div>
                <div className="w-full flex justify-end mt-2">
                    <a href="/forgot-password" className="text-sm text-white/80 hover:text-white">
                        Forgot Password?
                    </a>
                </div>
              </div>
              
              
              {/* "OR" Divider */}
              <div className="flex items-center gap-x-2 sm:gap-x-4 text-[#9AE9FD] mt-4">
                <div className="h-[1px] w-full bg-[#9BE9FD]"></div>
                <span>OR</span>
                <div className="h-[1px] w-full bg-[#9BE9FD]"></div>
              </div>

              {/* Continue with Google */}
              <button 
                type="button"
                onClick={handleGoogleLogin} 
                className="w-full h-10 sm:h-11 bg-[#C4C4C4] rounded-md flex items-center justify-center gap-x-3 text-black font-medium text-sm sm:text-base transition hover:bg-gray-400"
              >
                <ColoredGoogleIcon />
                Continue with Google
              </button>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-center mt-2">
                  {error}
                </div>
              )}

              {/* Main Login Button */}
              <button 
                type="submit"
                className="w-full sm:w-40 h-10 sm:h-11 bg-[#9AE9FD] text-[#002732] font-black text-base sm:text-lg rounded-full self-center mt-6 transition hover:opacity-90"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;