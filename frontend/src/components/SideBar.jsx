import { Link } from 'react-router-dom';


// Icon Components
const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 6V18" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M20 8V14" stroke="currentColor" strokeWidth="2"/>
    <path d="M23 11H17" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const SwordIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 17.5L3 6L6 3L17.5 14.5L14.5 17.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M13 19L19 13L21 15L15 21L13 19Z" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9H4.5C3.70435 9 2.94129 9.31607 2.37868 9.87868C1.81607 10.4413 1.5 11.2044 1.5 12V13C1.5 13.7956 1.81607 14.5587 2.37868 15.1213C2.94129 15.6839 3.70435 16 4.5 16H6" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M18 9H19.5C20.2956 9 21.0587 9.31607 21.6213 9.87868C22.1839 10.4413 22.5 11.2044 22.5 12V13C22.5 13.7956 22.1839 14.5587 21.6213 15.1213C21.0587 15.6839 20.2956 16 19.5 16H18" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M6 12H18V3H6V12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 12V21" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 21H15" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 20V4C3 3.46957 3.21071 2.96086 3.58579 2.58579C3.96086 2.21071 4.46957 2 5 2H9" stroke="currentColor" strokeWidth="2" fill="none"/>
    <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" fill="none"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

function Sidebar({onLogout}) {
    
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-[#7FB3C1] p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#002732] mb-2">Edventure</h1>
      </div>
      
      {/* Navigation Menu */}
      <nav className="space-y-1">
        <div className="text-[#002732] font-semibold mb-4 text-sm">Dashboard</div>
        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-[#002732] hover:bg-[#6BA3B1] rounded-lg transition-colors">
          <HomeIcon />
          <span>Dashboard</span>
        </Link>
        <Link to="/courses" className="flex items-center gap-3 px-4 py-3 text-[#002732] hover:bg-[#6BA3B1] rounded-lg transition-colors">
          <BookIcon />
          <span>Subjects</span>
        </Link>
        <Link to="/friends" className="flex items-center gap-3 px-4 py-3 text-[#002732] hover:bg-[#6BA3B1] rounded-lg transition-colors">
          <UsersIcon />
          <span>Your Squad</span>
        </Link>
        <Link to="/battlegrounds/lobby" className="flex items-center gap-3 px-4 py-3 text-[#002732] hover:bg-[#6BA3B1] rounded-lg transition-colors">
          <SwordIcon />
          <span>Battle Arena</span>
        </Link>
        <Link to="/rewards" className="flex items-center gap-3 px-4 py-3 text-[#002732] hover:bg-[#6BA3B1] rounded-lg transition-colors">
          <TrophyIcon />
          <span>Rewards</span>
        </Link>
        
        <div className="border-t border-[#6BA3B1] my-6"></div>
        
        <Link to="/" className="flex items-center gap-3 px-4 py-3 text-[#002732] hover:bg-[#6BA3B1] rounded-lg transition-colors">
          <HomeIcon />
          <span>Home</span>
        </Link>
        <Link to="/help" className="flex items-center gap-3 px-4 py-3 text-[#002732] hover:bg-[#6BA3B1] rounded-lg transition-colors">
          <HelpIcon />
          <span>Help</span>
        </Link>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-[#002732] hover:bg-[#6BA3B1] rounded-lg transition-colors w-full text-left"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
