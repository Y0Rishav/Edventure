import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const LockIcon = () => (
    <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 16C7.46957 16 6.96086 15.7893 6.58579 15.4142C6.21071 15.0391 6 14.5304 6 14C6 12.89 6.89 12 8 12C8.53043 12 9.03914 12.2107 9.41421 12.5858C9.78929 12.9609 10 13.4696 10 14C10 14.5304 9.78929 15.0391 9.41421 15.4142C9.03914 15.7893 8.53043 16 8 16ZM14 19V9H2V19H14ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 7.89 0.89 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z" fill="#002732"/>
    </svg>
);
function ForgotPassword() {
    const navigate=useNavigate()
    const [email,setEmail]=useState('')
  const handleSendOtp = async (e) => {
    e.preventDefault();
    // Add your OTP sending logic here
    
    try {
        const response=await axios(`${import.meta.env.VITE_BACKEND_URL}/sendotp`,{
            email:email,
        });
        navigate('/resetPassword')
    } catch (error) {
        console.log("Llogin Failed");
        
    }
  };
  

  return (
    <div 
      className="flex items-center justify-center min-h-screen w-full bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(20,78,94,1)_100%)] relative overflow-hidden p-4"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="flex flex-col items-center z-10 w-full max-w-md relative">
        {/* Background decorative circles - size decreased */}
        <div className="absolute top-0 left-0 w-full h-full hidden md:block">
            <div className="absolute top-[2%] right-[-12%] w-24 h-24 border-2 border-[#9BE9FD]/80 rounded-full opacity-30"></div>
            <div className="absolute top-[42%] left-[-18%] w-24 h-24 border-2 border-[#9BE9FD]/80 rounded-full opacity-30"></div>
            <div className="absolute bottom-[8%] right-[-18%] w-24 h-24 border-2 border-[#9BE9FD]/80 rounded-full opacity-30"></div>
        </div>

        {/* Form Container */}
        <div className="relative w-full z-10">
          <div className="absolute -top-1 -left-1 sm:-left-4 w-[102%] h-full bg-white/90 rounded-[50px]"></div>
          
          <div className="relative w-full h-auto bg-[#001318] rounded-[50px] p-8 md:p-10 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#9AE9FD] text-center mb-4">
              Forgot Password
            </h1>
           

            <form onSubmit={handleSendOtp} className="flex flex-col w-full gap-y-6">
              {/* Email Input */}
              <div>
                <label className="text-white text-base md:text-lg mb-2 block">Email</label>
                <input 
                  type="email" 
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  className="w-full h-11 bg-[#C4C4C4] px-4 text-black text-base md:text-lg border-none outline-none rounded-md placeholder:text-gray-600"
                />
              </div>

              {/* Submit Button */}
              <button type="submit"  className="w-48 h-11 bg-[#9AE9FD] text-[#002732] font-black text-lg rounded-full self-center mt-4 transition hover:opacity-90">
                Send OTP
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;