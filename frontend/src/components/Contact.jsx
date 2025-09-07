import React from 'react';
import SideBar from './SideBar'; 

// --- Social Media Icon Components ---
const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 transition-colors duration-200 group-hover:stroke-[#22D3EE]"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);
const LinkedinIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 transition-colors duration-200 group-hover:stroke-[#22D3EE]"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 transition-colors duration-200 group-hover:stroke-[#22D3EE]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

// Reusable Card component for consistent styling
const MemberCard = ({ name, role, children }) => (
    <div className={`relative w-full h-full group`}>
      <div className="absolute top-1.5 left-1.5 w-full h-full rounded-2xl bg-[#0A2229]"></div>
      <div
        className="relative rounded-2xl p-6 text-center w-full h-full shadow-lg shadow-[#0A2229] transition-all duration-300 ease-out group-hover:shadow-xl group-hover:shadow-[#22D3EE]/30 group-hover:-translate-y-2"
        style={{ backgroundColor: '#1A3A4A' }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0F2933] to-[#144A5F] mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl font-bold text-[#22D3EE]">{name.charAt(0)}</span>
        </div>
        <h3 className="text-xl font-bold text-white">{name}</h3>
        {role && <p className="text-sm font-bold mt-1" style={{color: '#22D3EE'}}>{role}</p>}
        <p className="text-gray-400 mt-1">NIT Jamshedpur | CSE, 2nd Year</p>
        <div className="mt-4 flex justify-center gap-4 text-gray-400">
            {children}
        </div>
      </div>
    </div>
);


function Contact() {
  const teamMembers = [
    { name: 'Kriti', role: 'Team Leader' },
    { name: 'Rishav', role: 'Team Member' },
    { name: 'Swayam', role: 'Team Member' },
    { name: 'Harshit', role: 'Team Member' },
    { name: 'Shubham', role: 'Team Member' },
  ];

  const leader = teamMembers.find(member => member.role === 'Team Leader');
  const members = teamMembers.filter(member => member.role !== 'Team Leader');

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#0A1F2B' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
          <div className="flex flex-col items-center pt-16 sm:pt-20 lg:pt-24 pb-16">

            {/* Header Section */}
            <div className="flex flex-col items-center w-full max-w-4xl text-center mb-12 sm:mb-16">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Meet the Team
              </h1>
              <p className="text-base sm:text-lg lg:text-xl font-light italic text-gray-300 mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                The creators behind the mission: <span className="font-bold not-italic" style={{color: '#22D3EE'}}>Codeforge</span>
              </p>
            </div>

            {/* Team Members Container */}
            <div className="w-full flex flex-col items-center gap-12">
              
              {/* Leader Card */}
              {leader && (
                <div className="w-full max-w-xs">
                  <MemberCard name={leader.name} role={leader.role}>
                     <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="group"><GithubIcon /></a>
                     <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="group"><LinkedinIcon /></a>
                     <a href="mailto:rishav123@gmail.com" className="group"><MailIcon /></a>
                  </MemberCard>
                </div>
              )}

              {/* Other Members Grid */}
              <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {members.map((member) => (
                  <MemberCard key={member.name} name={member.name}>
                     <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="group"><GithubIcon /></a>
                     <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="group"><LinkedinIcon /></a>
                     <a href="mailto:rishav123@gmail.com" className="group"><MailIcon /></a>
                  </MemberCard>
                ))}
              </div>
            </div>
            
          </div>
        </div>
    </div>
  );
}

export default Contact;

