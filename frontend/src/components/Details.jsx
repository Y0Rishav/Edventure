import React, { useEffect, useState } from 'react';
import SideBar from './SideBar';
import './details.css'; // Using the modern, gamified CSS you approved

const Details = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Trigger the animation shortly after the component mounts
    const timer = setTimeout(() => setIsScrolled(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen">
      <SideBar />
  <main className="flex-1 min-h-screen w-full ml-64 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8" style={{ background: 'linear-gradient(180deg, #051418 0%, #103E4C 100%)' }}>
        
        {/* The Scroll Container */}
        <div className={`scroll-container ${isScrolled ? 'unrolled' : ''}`}>
          <div className="scroll-top"></div>
          <div className="scroll-content">
            <div className="p-8 md:p-12 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                Mission Briefing: Edventure
              </h1>
              <p className="text-lg italic mb-8 text-gray-300">
                Level Up Your Learning Experience.
              </p>

              <div className="text-left space-y-6 text-base text-gray-200">
                <p>
                  Welcome to <span className="font-bold" style={{ color: '#22D3EE' }}>Edventure</span>, a next-generation platform where education evolves into an engaging gameplay experience. Our mission is to dismantle the passive nature of traditional learning and forge a new path—one where knowledge is a power-up and every lesson is a new level to conquer.
                </p>
                
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>Core Directives:</h2>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><span className="font-bold text-white">Battle Arena:</span> Go head-to-head with peers in real-time quiz duels that test your speed and accuracy.</li>
                    <li><span className="font-bold text-white">Form Your Squad:</span> Connect with friends, create study groups, and tackle learning challenges together.</li>
                    <li><span className="font-bold text-white">Interactive Subjects:</span> Dive into a curated arsenal of the best online learning content, structured for maximum impact.</li>
                    <li><span className="font-bold text-white">Gamified Progression:</span> Earn XP, unlock achievement badges, and dominate the global leaderboards to prove your mastery.</li>
                  </ul>
                </div>

                <p>
                  Engineered with a high-performance MERN stack (MongoDB, Express, React, Node.js), Edventure is optimized for a seamless and responsive experience. We are committed to building a dynamic ecosystem where learning is not a chore, but an adventure. Your mission, should you choose to accept it, is to learn, compete, and conquer.
                </p>
              </div>
            </div>
          </div>
          <div className="scroll-bottom"></div>
        </div>
      </main>
    </div>
  );
};

export default Details;

