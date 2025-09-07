import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Sidebar from './SideBar';

// --- Helper Components ---
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

const Spinner = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9AE9FD] mx-auto"></div>
);

// --- Main App Component ---
const Pdfquiz = () => {
  // --- State Management ---
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [quizContent, setQuizContent] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'idle', 'error', 'quiz', 'finished'
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isPdfJsLoaded, setIsPdfJsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  // --- Icons ---
  const ICONS = {
    upload: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    check: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    cross: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    retry: "M16.023 9.348h4.992v-.001a.75.75 0 01.727.727l.002.002V11.25a.75.75 0 01-.727.727l-.002.002h-4.992a2.25 2.25 0 01-2.248-2.248l.001-.002v-1.904a2.25 2.25 0 012.248-2.248l-.001-.002zM6.378 15.168A.75.75 0 016.75 16.5h1.02a.75.75 0 01.728.727l.002.002v1.02a.75.75 0 01-.728.727l-.002.002H6.75a2.25 2.25 0 01-2.248-2.248l.001-.002v-1.02a2.25 2.25 0 012.248-2.248l-.001-.002h1.02a.75.75 0 01.728.727l.002.002v1.02a.75.75 0 01-.728.727l-.002.002H6.75a.75.75 0 01-.728-.727l-.002-.002v-1.02a.75.75 0 01.378-.651zM11.25 16.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5z",
    document: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m-1.125 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  };

  // --- Effects ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;
      setIsPdfJsLoaded(true);
      setStatus('idle');
    };
    script.onerror = () => {
      setError('Failed to load PDF processing library. Please try again later.');
      setStatus('error');
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (status === 'quiz' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    } else if (status === 'quiz' && timeLeft === 0) {
      handleNextQuestion(null);
    }
  }, [timeLeft, status]);

  // --- Logic and Handlers ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    } else {
      setError('Please select a valid PDF file.');
      setFile(null);
      setFileName('');
    }
  };

  const resetState = () => {
    setFile(null);
    setFileName('');
    setQuizContent(null);
    setStatus('idle');
    setError('');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setTimeLeft(30);
  };

  const callGeminiAPI = async (text) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API key is missing. Please check your .env file.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const systemPrompt = `You are an expert quiz creator. Your task is to create a multiple-choice quiz based solely on the provided text.

    - Generate exactly 10 questions.
    - Each question must have 4 options, with one correct answer.
    - Questions must be derived strictly from the content and core concepts explicitly mentioned in the provided text.
    - Do not generate questions about metadata (e.g., document title, assignment name) or topics not explicitly covered in the text.
    - Avoid extrapolating or introducing external topics not present in the text.
    - Ensure questions are clear, relevant, and focused on key information or concepts directly stated in the text.
    - Return the response as a JSON object with the following structure:

    {
      "questions": [
        {
          "question": "Question text here",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "The correct option text"
        }
      ]
    }`;

    const prompt = `${systemPrompt}\n\nCreate a quiz from this text: ${text}`;

    let attempt = 0;
    const maxAttempts = 5;

    while (attempt < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text();

        if (!jsonText) {
          throw new Error("Received an empty response from the AI.");
        }

        const cleanedJson = jsonText.replace(/```json\n?|\n?```/g, '').trim();
        const quizData = JSON.parse(cleanedJson);

        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          throw new Error("Invalid quiz structure received.");
        }

        return quizData;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        attempt++;
        if (attempt >= maxAttempts) {
          throw new Error(`Failed to generate quiz after ${maxAttempts} attempts: ${error.message}`);
        }
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a PDF file first.');
      return;
    }
    if (!isPdfJsLoaded) {
      setError('PDF processing library is not loaded yet. Please wait a moment.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (event) => {
        try {
          const pdfData = new Uint8Array(event.target.result);
          const pdf = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }

          const truncatedText = fullText.substring(0, 15000);
          const quizData = await callGeminiAPI(truncatedText);

          if (quizData && quizData.questions && quizData.questions.length > 0) {
            setQuizContent(quizData);
            setStatus('quiz');
            setTimeLeft(30);
          } else {
            throw new Error("Failed to generate a valid quiz. The AI response was empty or malformed.");
          }
        } catch (err) {
          console.error(err);
          setError(`An error occurred: ${err.message}. Please try a different PDF or try again later.`);
          setStatus('error');
        }
      };
    } catch (err) {
      console.error(err);
      setError(`An error occurred during file processing: ${err.message}`);
      setStatus('error');
    }
  };

  const handleAnswerSelect = (option, index) => {
    if (selectedAnswer !== null) return;

    const timeSnapshot = timeLeft;
    setSelectedAnswer(index);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setTimeout(() => {
      handleNextQuestion(option, index, timeSnapshot);
    }, 700);
  };

  const handleNextQuestion = (option, index, timeLeftAtSubmit) => {
    const usedAnswer = option !== null ? option : null;
    const usedIndex = index !== null ? index : -1;

    setUserAnswers([...userAnswers, { answer: usedAnswer, index: usedIndex }]);

    if (currentQuestionIndex < quizContent.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setStatus('finished');
    }
  };

  const handleLogout = () => {
    // Add your logout logic here
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // --- Render Functions ---
  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] bg-[#0A1F2B]">
      <div className="text-center">
        <Spinner />
        <p className="text-lg font-semibold mb-2 text-[#9AE9FD]">Loading PDF Tools</p>
        <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
      </div>
    </div>
  );

  const renderIdle = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] bg-[#0A1F2B]">
      <div className="w-full max-w-4xl">
        <div className="bg-[#1E3A47] p-8 rounded-3xl shadow mb-6">
          <h1 className="text-3xl font-bold text-[#9AE9FD] text-center mb-4">PDF to Quiz Generator</h1>
          <p className="text-gray-400 text-center mb-6">Upload your PDF and get a quiz in seconds!</p>
          <div className="space-y-6">
            <label htmlFor="file-upload" className="group cursor-pointer w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#9AE9FD] rounded-2xl bg-[#0F2933] hover:bg-[#0A1F2B] transition-colors duration-300">
              <Icon path={ICONS.upload} className="w-16 h-16 text-[#9AE9FD] group-hover:text-white transition-colors duration-300" />
              <p className="mt-4 text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                {fileName ? 'Selected:' : 'Drag & drop or click to upload'}
                {fileName && <span className="font-semibold text-white ml-2">{fileName}</span>}
              </p>
              <input id="file-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!file || !isPdfJsLoaded}
              className="w-full font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg disabled:shadow-none bg-[#9AE9FD] text-[#002732] hover:bg-[#7FB3C1]"
            >
              {isPdfJsLoaded ? 'Generate Quiz' : 'Loading PDF Tools...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] bg-[#0A1F2B]">
      <div className="w-full max-w-4xl">
        <div className="bg-[#1E3A47] p-8 rounded-3xl shadow text-center">
          <Icon path={ICONS.cross} className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#9AE9FD] mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={resetState}
            className="font-bold py-3 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg bg-[#9AE9FD] text-[#002732] hover:bg-[#7FB3C1]"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!quizContent) return renderError();
    const currentQuestion = quizContent.questions[currentQuestionIndex];
    if (!currentQuestion) return <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] bg-[#0A1F2B] text-[#9AE9FD]">No questions available</div>;

    return (
      <div className="min-h-[calc(100vh-2rem)] bg-[#0A1F2B] text-white p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-[#1E3A47] p-6 rounded-3xl shadow mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#9AE9FD]">PDF Quiz</h1>
                <p className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {quizContent.questions.length}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#9AE9FD]">{score} points</div>
                <div className="text-xs text-gray-400">Your Points</div>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-[#1E3A47] p-4 rounded-2xl shadow mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-white">Time Left:</span>
              <span className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-[#9AE9FD]'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-[#9AE9FD]'}`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-[#7FB3C1] p-8 rounded-3xl shadow mb-6">
            <div className="bg-[#5A9AA8] rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="text-6xl font-black text-[#002732]">Q.</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-medium text-[#002732] leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => {
                let optionClass = 'bg-[#002732] text-white hover:bg-[#1E2A32]';
                if (selectedAnswer !== null) {
                  if (index === currentQuestion.options.indexOf(currentQuestion.correctAnswer)) {
                    optionClass = 'bg-green-500 text-white';
                  } else if (selectedAnswer === index && option !== currentQuestion.correctAnswer) {
                    optionClass = 'bg-red-500 text-white';
                  } else {
                    optionClass = 'bg-[#002732] text-gray-300';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option, index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-xl text-left font-medium transition-all duration-300 ${optionClass}`}
                  >
                    <span className="font-bold mr-3 text-lg">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          <div className="text-center">
            <button
              onClick={() => handleNextQuestion(selectedAnswer !== null ? userAnswers[currentQuestionIndex]?.answer : null, selectedAnswer, timeLeft)}
              disabled={selectedAnswer === null}
              className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all ${
                selectedAnswer !== null 
                  ? 'bg-[#002732] text-white hover:bg-[#1E2A32]' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFinished = () => (
    <div className="min-h-[calc(100vh-2rem)] bg-[#0A1F2B] p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#1E3A47] p-8 rounded-3xl shadow text-center mb-6">
          <h1 className="text-3xl font-bold text-[#9AE9FD] mb-4">Quiz Complete!</h1>
          <div className="mb-6">
            <p className="text-xl mb-2 text-white">{score > 80 ? 'Excellent performance!' : score > 50 ? 'Good job!' : 'Keep practicing!'}</p>
            <div className="bg-blue-500/20 p-4 rounded">
              <h3 className="text-lg font-semibold text-blue-300">Your Score</h3>
              <p className="text-2xl text-blue-400">{score} points</p>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="bg-[#1E3A47] p-6 rounded-3xl shadow">
          <h2 className="text-2xl font-semibold mb-6 text-center text-[#9AE9FD]">Quiz Analytics</h2>
          <div className="space-y-6">
            {quizContent.questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer?.answer === question.correctAnswer;
              return (
                <div key={index} className="border border-gray-600 rounded-lg p-4 bg-[#0A1F2B]">
                  <h3 className="text-lg font-medium mb-3 text-[#9AE9FD]">Question {index + 1}</h3>
                  <p className="text-gray-300 mb-4">{question.question}</p>
                  <div className="bg-blue-500/20 p-3 rounded">
                    <h4 className="font-semibold text-blue-300">Your Answer</h4>
                    <p className={`text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {userAnswer?.answer || 'No answer'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isCorrect ? '✅ Correct' : userAnswer?.answer ? '❌ Incorrect' : '⏰ Time out'}
                    </p>
                  </div>
                  {!isCorrect && (
                    <div className="mt-3 p-3 bg-green-500/20 rounded">
                      <h4 className="font-semibold text-green-300">Correct Answer</h4>
                      <p className="text-green-400">{question.correctAnswer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetState}
              className="bg-[#9AE9FD] text-[#002732] px-6 py-3 rounded-2xl hover:bg-[#7FB3C1] font-bold transition-all duration-300"
            >
              Create Another Quiz
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-[#1E3A47] text-white px-6 py-3 rounded-2xl hover:bg-[#2A4A5A] font-bold transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Main Render Switch ---
  const renderContent = () => {
    switch (status) {
      case 'loading': return renderLoading();
      case 'idle': return renderIdle();
      case 'error': return renderError();
      case 'quiz': return renderQuiz();
      case 'finished': return renderFinished();
      default: return renderLoading();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1F2B] flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 md:ml-64 p-4 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Pdfquiz;