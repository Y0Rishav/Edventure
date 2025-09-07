import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Chatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [step, setStep] = useState(0); // 0: ask name, 1: ready
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatbotMessages');
    const savedUserName = localStorage.getItem('chatbotUserName');
    const savedStep = localStorage.getItem('chatbotStep');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    if (savedUserName) {
      setUserName(savedUserName);
    }
    if (savedStep) {
      setStep(parseInt(savedStep));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatbotMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatbotUserName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('chatbotStep', step.toString());
  }, [step]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Check if we're in battlegrounds mode
  const isInBattlegrounds = location.pathname.includes('/battlegrounds');

  // Don't render anything if in battlegrounds
  if (isInBattlegrounds) {
    return null;
  }

  const parseMessage = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part.split('\n').map((line, lineIndex) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < part.split('\n').length - 1 && <br />}
        </span>
      ));
    });
  };

  const sendMessage = async (message) => {
    const newMessages = [...messages, { role: 'user', parts: [{ text: message }] }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot`, {
        history: newMessages,
        user_name: userName
      });
      const aiReply = response.data.reply;
      setMessages([...newMessages, { role: 'model', parts: [{ text: aiReply }] }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...newMessages, { role: 'model', parts: [{ text: 'Sorry, I am unable to respond right now.' }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      if (step === 0) {
        const userInput = input.trim();
        setUserName(userInput);
        setStep(1);
        setInput(''); // Clear input immediately
        // Add user's name to messages
        setMessages(prev => [...prev, { role: 'user', parts: [{ text: userInput }] }]);
        // Show typing animation
        setIsTyping(true);
        // Add AI response with delay
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Hi ${userInput}! I am Era. Feel free to ask your doubt 🤖` }] }]);
        }, 1500); // Slightly longer delay for better UX
      } else {
        sendMessage(input.trim());
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Start conversation
      setMessages([{ role: 'model', parts: [{ text: 'Hi! What\'s your name? 👋' }] }]);
    }
  };

return (
    <>
        {/* Floating Button */}
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={toggleChat}
                className="bg-[#98B7BF] hover:bg-[#9BE9FD] text-black rounded-full p-3 sm:p-4 shadow-lg transform transition-transform hover:scale-110 text-sm sm:text-base"
            >
                💬 Need help? Ask Era!
            </button>
        </div>

        {/* Chat Window */}
        {isOpen && (
            <div className="fixed bottom-16 right-4 left-4 sm:left-auto w-auto sm:w-96 h-[70vh] sm:h-[28rem] bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(20,78,94,1)_100%)] border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col animate-fade-in">
                <div className="bg-[#002732] text-[#9BE9FD] p-3 rounded-t-lg">
                    <h3 className="text-base sm:text-lg font-semibold">ERA - Your AI Tutor 🤖</h3>
                </div>
                <div className="flex-1 p-2 sm:p-3 overflow-hidden bg-[#001318]/90 relative">
                    <div
                        className="h-full overflow-y-auto scrollbar-hide"
                        ref={messagesEndRef}
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {messages.map((msg, index) => (
                            <div key={index} className={`mb-2 sm:mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block p-2 sm:p-3 rounded-lg max-w-xs sm:max-w-sm break-words text-sm sm:text-base ${
                                    msg.role === 'user' 
                                        ? 'bg-[#144F5F] text-white' 
                                        : 'bg-white/10 text-[#9BE9FD] border border-[#9BE9FD]/30'
                                }`}>
                                    {parseMessage(msg.parts[0].text)}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="text-left mb-2 sm:mb-3">
                                <div className="inline-block p-2 sm:p-3 rounded-lg bg-white/10 text-[#9BE9FD] border border-[#9BE9FD]/30">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-[#9BE9FD] rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[#9BE9FD] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-[#9BE9FD] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Scroll to bottom arrow */}
                    <button
                        onClick={() => {
                            if (messagesEndRef.current) {
                                messagesEndRef.current.scrollTo({
                                    top: messagesEndRef.current.scrollHeight,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                        className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-[#98B7BF] text-white rounded-full p-1 sm:p-2 shadow-lg transition-colors text-sm sm:text-base"
                    >
                        ↓
                    </button>
                </div>
                <div className="p-2 sm:p-3 border-t border-gray-700 bg-[#001318]">
                    <div className="flex">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={
                                step === 0 ? "Enter your name..." : "Ask your question..."
                            }
                            className="flex-1 border border-gray-600 rounded-l-lg px-3 py-2 bg-[#002732] text-[#9BE9FD] placeholder-[#9BE9FD]/60 focus:outline-none focus:ring-2 focus:ring-[#9BE9FD] focus:border-transparent text-sm sm:text-base"
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isTyping}
                            className="bg-[#144F5F] hover:bg-[#9BE9FD] hover:text-black text-white px-3 sm:px-4 py-2 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            {isTyping ? '...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
);
};

export default Chatbot;
