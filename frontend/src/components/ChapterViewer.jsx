import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function ChapterViewer() {
  const [chapter, setChapter] = useState(null);
  const [user, setUser] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        setUser(userRes.data);
        const chapterRes = await axios.get(`http://localhost:5000/api/chapters/${id}`);
        setChapter(chapterRes.data);
        if (chapterRes.data.quiz && chapterRes.data.quiz.questions) {
          setAnswers(new Array(chapterRes.data.quiz.questions.length).fill(null));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [id]);

  const handleQuizSubmit = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/chapters/${id}/quiz`, { answers }, { withCredentials: true });
      setScore(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!chapter || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 mb-4">
        <h1 className="text-2xl">{chapter.title}</h1>
        <Link to={`/course/${chapter.course}`} className="text-white underline">Back to Course</Link>
      </header>
      <div className="max-w-4xl mx-auto">
        <p className="mb-4">{chapter.description}</p>
        {!quizMode ? (
          <div className="mb-4">
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${chapter.videoId}`}
              title={chapter.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button onClick={() => setQuizMode(true)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Take Quiz</button>
          </div>
        ) : score !== null ? (
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xl mb-2">Quiz Results</h3>
            <p>You scored {score.score} out of {score.total}!</p>
            <Link to={`/course/${chapter.course}`} className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded">Back to Course</Link>
          </div>
        ) : (
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xl mb-4">Quiz</h3>
            {chapter.quiz && chapter.quiz.questions.map((q, i) => (
              <div key={i} className="mb-4">
                <p className="font-semibold">{q.question}</p>
                {q.options.map((option, j) => (
                  <label key={j} className="block">
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={j}
                      onChange={() => {
                        const newAnswers = [...answers];
                        newAnswers[i] = j;
                        setAnswers(newAnswers);
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}
            <button onClick={handleQuizSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Submit Quiz</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChapterViewer;
