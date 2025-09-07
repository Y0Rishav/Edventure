import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SideBar from './SideBar'; // Import the SideBar component

// --- SVG Icon Components ---
const VectorIcon = () => (
    <svg width="31" height="34" viewBox="0 0 31 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24.2088 0L29.9278 0.00550195L29.931 6.46658L21.1089 16.4911L25.6724 21.6794L27.9558 19.0861L30.2392 21.6794L26.2453 26.2185L30.8089 31.4068L28.5271 34L23.9619 28.8117L19.9696 33.3508L17.6862 30.7575L19.968 28.1625L15.4028 22.976L10.8393 28.1625L13.1227 30.7575L10.8409 33.3508L6.84695 28.8117L2.28178 34L0 31.4068L4.56517 26.2166L0.571252 21.6794L2.85303 19.0861L5.13481 21.6775L9.69676 16.4911L0.885925 6.47759L0.87947 0L6.60167 0.00550195L15.4012 10.008L24.2088 0ZM11.9769 19.0843L7.41336 24.2708L8.55587 25.5674L13.1178 20.3809L11.9769 19.0843ZM26.7004 3.66978H25.5434L17.6846 12.5994L18.8239 13.896L26.7004 4.94806V3.66978ZM4.1085 3.66978V4.95356L22.2482 25.5692L23.3891 24.2726L5.2623 3.67161L4.1085 3.66978Z" fill="#FFFFFF"/>
    </svg>
);
const GroupIcon = () => (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M23.1818 12.3636C23.1818 14.0031 22.5305 15.5755 21.3711 16.7348C20.2118 17.8941 18.6395 18.5454 16.9999 18.5454C15.3604 18.5454 13.788 17.8941 12.6287 16.7348C11.4694 15.5755 10.8181 14.0031 10.8181 12.3636C10.8181 10.7241 11.4694 9.15169 12.6287 7.99238C13.788 6.83306 15.3604 6.18176 16.9999 6.18176C18.6395 6.18176 20.2118 6.83306 21.3711 7.99238C22.5305 9.15169 23.1818 10.7241 23.1818 12.3636ZM20.0908 12.3636C20.0908 13.1833 19.7652 13.9695 19.1855 14.5492C18.6059 15.1288 17.8197 15.4545 16.9999 15.4545C16.1802 15.4545 15.394 15.1288 14.8143 14.5492C14.2347 13.9695 13.909 13.1833 13.909 12.3636C13.909 11.5438 14.2347 10.7576 14.8143 10.178C15.394 9.59832 16.1802 9.27267 16.9999 9.27267C17.8197 9.27267 18.6059 9.59832 19.1855 10.178C19.7652 10.7576 20.0908 11.5438 20.0908 12.3636Z" fill="#FFFFFF"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M17 0C7.61136 0 0 7.61136 0 17C0 26.3886 7.61136 34 17 34C26.3886 34 34 26.3886 34 17C34 7.61136 26.3886 0 17 0ZM3.09091 17C3.09091 20.23 4.19282 23.2035 6.03964 25.5649C7.33696 23.862 9.01024 22.4819 10.9289 21.5324C12.8476 20.5829 14.9597 20.0895 17.1005 20.0909C19.2137 20.0884 21.2996 20.5686 23.199 21.4948C25.0985 22.4209 26.7613 23.7686 28.0608 25.4351C29.3999 23.6788 30.3015 21.629 30.691 19.4551C31.0806 17.2812 30.9468 15.0458 30.3009 12.9339C29.655 10.8219 28.5155 8.89416 26.9767 7.31006C25.4378 5.72595 23.5438 4.53106 21.4515 3.82424C19.3592 3.11743 17.1286 2.91901 14.9443 3.24541C12.7601 3.57181 10.6849 4.41365 8.89064 5.70126C7.09634 6.98888 5.63444 8.68525 4.6259 10.65C3.61736 12.6148 3.09119 14.7915 3.09091 17ZM17 30.9091C13.8069 30.9143 10.7102 29.8158 8.23418 27.7996C9.23071 26.3726 10.5573 25.2075 12.101 24.4034C13.6448 23.5994 15.3599 23.1803 17.1005 23.1818C18.8193 23.1803 20.5136 23.589 22.0428 24.3738C23.5719 25.1587 24.8917 26.2971 25.8925 27.6945C23.3974 29.7763 20.2495 30.9142 17 30.9091Z" fill="#FFFFFF"/>
    </svg>
);
const SettingsIcon = () => (
    <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.8843 30.2499C14.2656 30.2499 13.733 30.0437 13.2866 29.6312C12.8402 29.2187 12.5707 28.7145 12.4781 28.1187L12.1687 25.8499C11.8708 25.7354 11.5903 25.5979 11.3272 25.4374C11.0641 25.277 10.8061 25.1052 10.5531 24.9218L8.42182 25.8156C7.84891 26.0677 7.27599 26.0906 6.70307 25.8843C6.13016 25.6781 5.68328 25.3114 5.36245 24.7843L3.74683 21.9656C3.42599 21.4385 3.33433 20.877 3.47183 20.2812C3.60933 19.6854 3.9187 19.1927 4.39995 18.8031L6.22182 17.4281C6.19891 17.2677 6.18745 17.1127 6.18745 16.9633V16.0352C6.18745 15.8867 6.19891 15.7322 6.22182 15.5718L4.39995 14.1968C3.9187 13.8072 3.60933 13.3145 3.47183 12.7187C3.33433 12.1229 3.42599 11.5614 3.74683 11.0343L5.36245 8.21557C5.68328 7.68849 6.13016 7.32182 6.70307 7.11557C7.27599 6.90932 7.84891 6.93224 8.42182 7.18432L10.5531 8.07807C10.8052 7.89474 11.0687 7.72286 11.3437 7.56245C11.6187 7.40203 11.8937 7.26453 12.1687 7.14995L12.4781 4.8812C12.5697 4.28536 12.8392 3.7812 13.2866 3.3687C13.7339 2.9562 14.2665 2.74995 14.8843 2.74995H18.1156C18.7343 2.74995 19.2674 2.9562 19.7147 3.3687C20.162 3.7812 20.4311 4.28536 20.5218 4.8812L20.8312 7.14995C21.1291 7.26453 21.4101 7.40203 21.6741 7.56245C21.9381 7.72286 22.1957 7.89474 22.4468 8.07807L24.5781 7.18432C25.151 6.93224 25.7239 6.90932 26.2968 7.11557C26.8697 7.32182 27.3166 7.68849 27.6374 8.21557L29.2531 11.0343C29.5739 11.5614 29.6656 12.1229 29.5281 12.7187C29.3906 13.3145 29.0812 13.8072 28.5999 14.1968L26.7781 15.5718C26.801 15.7322 26.8124 15.8872 26.8124 16.0366V16.9633C26.8124 17.1127 26.7895 17.2677 26.7437 17.4281L28.5656 18.8031C29.0468 19.1927 29.3562 19.6854 29.4937 20.2812C29.6312 20.877 29.5395 21.4385 29.2187 21.9656L27.5687 24.7843C27.2479 25.3114 26.801 25.6781 26.2281 25.8843C25.6552 26.0906 25.0822 26.0677 24.5093 25.8156L22.4468 24.9218C22.1947 25.1052 21.9312 25.277 21.6562 25.4374C21.3812 25.5979 21.1062 25.7354 20.8312 25.8499L20.5218 28.1187C20.4302 28.7145 20.1611 29.2187 19.7147 29.6312C19.2683 30.0437 18.7352 30.2499 18.1156 30.2499H14.8843ZM16.5687 21.3124C17.8979 21.3124 19.0322 20.8427 19.9718 19.9031C20.9114 18.9635 21.3812 17.8291 21.3812 16.4999C21.3812 15.1708 20.9114 14.0364 19.9718 13.0968C19.0322 12.1572 17.8979 11.6874 16.5687 11.6874C15.2166 11.6874 14.0763 12.1572 13.1477 13.0968C12.2191 14.0364 11.7553 15.1708 11.7562 16.4999C11.7571 17.8291 12.2214 18.9635 13.1491 19.9031C14.0767 20.8427 15.2166 21.3124 16.5687 21.3124Z" fill="#FFFFFF"/>
    </svg>
);
const PlusIcon = () => (
    <svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27.6345 16.5714H17.0059V26.9285C17.0059 27.4779 16.7819 28.0048 16.3832 28.3932C15.9846 28.7817 15.4439 28.9999 14.8801 28.9999C14.3163 28.9999 13.7757 28.7817 13.377 28.3932C12.9784 28.0048 12.7544 27.4779 12.7544 26.9285V16.5714H2.12573C1.56195 16.5714 1.02127 16.3532 0.622613 15.9647C0.223961 15.5762 0 15.0493 0 14.5C0 13.9506 0.223961 13.4237 0.622613 13.0353C1.02127 12.6468 1.56195 12.4285 2.12573 12.4285H12.7544V2.07142C12.7544 1.52205 12.9784 0.995173 13.377 0.606706C13.7757 0.218238 14.3163 0 14.8801 0C15.4439 0 15.9846 0.218238 16.3832 0.606706C16.7819 0.995173 17.0059 1.52205 17.0059 2.07142V12.4285H27.6345C28.1983 12.4285 28.739 12.6468 29.1376 13.0353C29.5363 13.4237 29.7603 13.9506 29.7603 14.5C29.7603 15.0493 29.5363 15.5762 29.1376 15.9647C28.739 16.3532 28.1983 16.5714 27.6345 16.5714Z" fill="white"/>
    </svg>
);
const MinusIcon = () => (
    <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28.219 21.4839H8.78117C8.35157 21.4839 7.93956 21.1696 7.63579 20.61C7.33201 20.0504 7.16135 19.2914 7.16135 18.5001C7.16135 17.7087 7.33201 16.9497 7.63579 16.3901C7.93956 15.8306 8.35157 15.5162 8.78117 15.5162H28.219C28.6486 15.5162 29.0606 15.8306 29.3643 16.3901C29.6681 16.9497 29.8388 17.7087 29.8388 18.5001C29.8388 19.2914 29.6681 20.0504 29.3643 20.61C29.0606 21.1696 28.6486 21.4839 28.219 21.4839Z" fill="white"/>
    </svg>
);

const Help = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(2); // Third FAQ is expanded by default

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };
    const handleLogout = async () => {
      try {
        await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
        window.location.href = '/';
      } catch (err) {
        console.error('Logout failed', err);
      }
    };

  const helpCategories = [
    {
      icon: <VectorIcon />,
      title: "Get Started",
      href:'/details',
      description: "Learn how to create your account, explore key features, and more!",
      link: "Learn more"
    },
    {
      icon: <GroupIcon />,
      title: "Your Profile",
      href:'/profile',
      description: "Manage your profile, organize your bookmarks, and invite friends!",
      link: "Learn more"
    },
    {
      icon: <SettingsIcon />,
      title: "Settings",
      href:'/manage',
      description: "Manage account settings, preferences, visibility to others and more!",
      link: "Learn more"
    }
  ];

  const faqs = [
    {
      question: "How can I set up my account?",
      answer: "You can easily set up your account by clicking the 'Learn more' link under the 'Get Started' section above. This will provide a detailed guide through the entire process.",
      icon: <PlusIcon />
    },
    {
      question: "Is dark mode available?",
      answer: "Dark mode is not available at the moment, but our team is working on it and it will be coming soon in a future update. Stay tuned!",
      icon: <PlusIcon />
    },
    {
      question: "How does the 1v1 dual work?",
      answer: "A lobby is created, where you wait until the opponent joins and once they join, the quiz battle begins with 10 questions each. Points are awarded on the basis of accuracy and time taken.",
      icon: <MinusIcon />
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#0A1F2B]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center pt-16 sm:pt-20 lg:pt-24 pb-8">
            
            {/* Header Section */}
            <div className="flex flex-col items-center w-full max-w-4xl text-center mb-12 sm:mb-16 lg:mb-20">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Need Assistance?
              </h1>
              <p className="text-base sm:text-lg lg:text-xl font-light italic text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                Get the help you need and keep on learning!
              </p>
            </div>

            {/* Help Categories Section */}
            <div className="w-full mb-12 sm:mb-16 lg:mb-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 w-full">
                {helpCategories?.map((category, index) => (
                  <div key={index} className="relative w-full max-w-sm mx-auto group">
                    {/* Background shadow */}
                    <div className="absolute top-2 left-2 w-full h-full rounded-2xl bg-[#0A2229]"></div>
                    
                    {/* Main card */}
                    <div className="relative rounded-2xl p-6 sm:p-8 w-full transition-transform duration-300 group-hover:-translate-y-2 group-hover:-translate-x-1" 
                         style={{ 
                           backgroundColor: '#1A3A4A'
                         }}>
                      <div className="flex flex-col items-start h-auto">
                        {/* Icon */}
                        <div className="mb-5">
                          <div className="w-9 h-9">
                            {category.icon}
                          </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {category.title}
                        </h2>

                        {/* Description */}
                        <p className="text-sm sm:text-base font-normal text-gray-300 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {category.description}
                        </p>

                        {/* Learn more link */}
                        <div>
                         <Link to={category.href}
                              className="text-sm sm:text-base font-bold text-left transition-colors duration-200" 
                              style={{ color: '#22D3EE', fontFamily: 'Inter, sans-serif' }}>
                           {category.link}
                         </Link>
                          
                          {/* Underline */}
                          <div className="h-[2px] mt-1 transition-all duration-300 group-hover:w-full"
                               style={{ backgroundColor: '#22D3EE', width: '80px' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="flex flex-col lg:flex-row items-start w-full max-w-4xl gap-6 lg:gap-12">
              {/* FAQ Title */}
              <h2 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                FAQs:
              </h2>

              {/* FAQ Items */}
              <div className="flex flex-col gap-3 items-center w-full">
                {faqs?.map((faq, index) => (
                  <div key={index} className="w-full">
                    {/* Question */}
                    <div 
                      className={`flex justify-between items-center w-full cursor-pointer p-4 transition-colors duration-200 ${expandedFAQ === index ? 'rounded-t-md bg-[#0F2933]' : 'rounded-md hover:bg-[#0F2933]'}`}
                      style={{ backgroundColor: '#1A3A4A' }}
                      onClick={() => toggleFAQ(index)}
                    >
                      <p className="text-sm sm:text-base font-medium text-gray-200" 
                         style={{ fontFamily: 'Inter, sans-serif' }}>
                        {faq.question}
                      </p>
                      
                      <div className="w-7 h-7 flex items-center justify-center">
                        {expandedFAQ === index ? <MinusIcon /> : <PlusIcon />}
                      </div>
                    </div>

                    {/* Answer (only for expanded FAQ) */}
                    {expandedFAQ === index && faq.answer && (
                      <div className="p-4 rounded-b-md" 
                           style={{ 
                             backgroundColor: '#0F2933',
                           }}>
                        <p className="text-sm font-light text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Help;
