import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';

// Changed: Imported NavLink for active link styling
import { Link, NavLink, redirect, useNavigate } from 'react-router-dom';
import { QuillHamburgerIcon, BackgroundDecoration, EdventureLogo } from '../assets/icons.jsx';

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading, false = logged out, true = logged in
  const navigate = useNavigate()
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  // Check session on mount
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        if (!mounted) return;
        setIsLoggedIn(!!res.data);
      } catch (err) {
        if (!mounted) return;
        setIsLoggedIn(false);
      }
    };
    check();
    return () => { mounted = false };
  }, []);

  const buttoOnClick = async () => {
    // If we haven't determined login state yet, fetch once more
    if (isLoggedIn === null) {
      try {
        const res = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        if (res && res.data) {
          setIsLoggedIn(true);
          navigate('/dashboard');
          return;
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    }

    if (isLoggedIn) navigate('/dashboard');
    else navigate('/login');
  }
  return (
    <>
      <Helmet>
        <title>Embark on Your Academic Adventure | Edventure</title>
        <meta name="description" content="Join Edventure, your one-stop solution for quiz battles, performance analysis, and lectures." />
      </Helmet>

      <main className="w-full min-h-screen" style={{ backgroundColor: '#00222B' }}>
        <div className="w-full h-screen shadow-[0px_0px_100px_rgba(154,233,253,0.3)] overflow-hidden" 
             style={{ backgroundColor: '#00222B', border: '2px solid #1A3636' }}>
          <div className="relative flex flex-col items-center w-full px-8 md:px-16 py-8 h-full">
            
            <header className="w-full flex justify-between items-center z-20">
              <div className="flex items-center gap-4">
                <QuillHamburgerIcon />
                <h1 className="text-4xl font-semibold" style={{ color: '#FFFFFF' }}>
                  Edventure
                </h1>
              </div>

              {/* --- NAVIGATION CHANGES START HERE --- */}
              <nav className="hidden lg:flex items-center gap-12 text-xl font-semibold">
                <NavLink 
                  to="/" 
                  className={({ isActive }) =>
                    `transition-colors hover:text-sky-300 ${isActive ? 'text-sky-300' : 'text-white'}`
                  }
                >
                  Home
                </NavLink>
                {/* Changed: Replaced <a> tag with NavLink */}
                <NavLink 
                  to="/contact" 
                  className={({ isActive }) =>
                    `transition-colors hover:text-sky-300 ${isActive ? 'text-sky-300' : 'text-white'}`
                  }
                >
                  About Us
                </NavLink>
                <NavLink 
                  to="/help" 
                  className={({ isActive }) =>
                    `transition-colors hover:text-sky-300 ${isActive ? 'text-sky-300' : 'text-white'}`
                  }
                >
                  Help
                </NavLink>
              </nav>
              {/* --- NAVIGATION CHANGES END HERE --- */}

              <button onClick={buttoOnClick} className="font-semibold text-xl px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#7DD3FC', color: '#0F2A2A' }}>
                Login/Register
              </button>
            </header>

            {/* Hero Section */}
            <section className="relative w-full flex-grow flex justify-center items-center z-10">
              <div className="flex flex-col lg:flex-row justify-between items-center w-full max-w-6xl">
                
                <div className="flex flex-col items-start text-center lg:text-left lg:w-3/5">
                  <h2 className="text-[48px] sm:text-[60px] md:text-[70px] font-bold leading-tight font-serif"
                      style={{ color: '#FFFFFF' }}>
                    Embark on your
                    <br />
                    academic adventure
                    <br />
                    with <span className='font-[cursive]' style={{ color: '#7DD3FC' }}>Edventure</span> !
                  </h2>
                  
                  <p className="text-2xl font-extralight leading-normal mt-8 max-w-lg mx-auto lg:mx-0"
                     style={{ color: '#B8D4D4' }}>
                    Your one stop solution for quiz battles, performance analyzer, lectures and much more....
                  </p>
                  
                  <div className="flex items-center gap-3 mt-12 mx-auto lg:mx-0">
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#4ADE80' }}></div>
                    <span className="text-2xl font-semibold" style={{ color: '#FFFFFF' }}>
                      5 Active Learners
                    </span>
                  </div>
                </div>

                <div className="mt-12 lg:mt-0 ">
                  <EdventureLogo />
                </div>
              </div>
            </section>
            
            <div className="absolute bottom-0 left-0 w-full z-0">
              <BackgroundDecoration />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;