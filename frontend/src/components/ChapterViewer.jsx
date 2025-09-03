import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function ChapterViewer() {
  const [chapter, setChapter] = useState(null);
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [video, setVideo] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
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
        // Fetch course to get subject and class
        const courseRes = await axios.get(`http://localhost:5000/api/courses/${chapterRes.data.course}`);
        setCourse(courseRes.data);

        // Fetch appropriate video based on class, subject, and chapter
        const videoRes = await axios.get(`http://localhost:5000/api/videos?class=${courseRes.data.class}&subject=${courseRes.data.subject}&chapter=${encodeURIComponent(chapterRes.data.title)}`);
        if (videoRes.data.length > 0) {
          setVideo(videoRes.data[0]); // Use the first matching video
        }

        // Filter notes for this chapter/video
        if (userRes.data && userRes.data.notes) {
          const chapterNotes = userRes.data.notes.filter(note => note.chapterId === id);
          setNotes(chapterNotes);
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
      // Update points
      const points = res.data.score * 10;
      const badge = res.data.score === res.data.total ? 'Quiz Master' : null;
      await axios.post('http://localhost:5000/auth/update_points', { points, badge }, { withCredentials: true });
      // Update progress
      await axios.post('http://localhost:5000/auth/update_progress', {
        subject: course.subject,
        chapter: chapter.title,
        completed: true
      }, { withCredentials: true });
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await axios.post('http://localhost:5000/auth/add_note', {
        chapterId: id,
        content: newNote
      }, { withCredentials: true });
      setNotes([...notes, { chapterId: id, timestamp: Date.now(), content: newNote }]);
      setNewNote('');
    } catch (err) {
      console.log(err);
    }
  };

  if (!chapter || !user || !course) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

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
            {video ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                <div className="mb-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                    Difficulty: {video.difficulty_level}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Duration: {video.duration}
                  </span>
                </div>
                <iframe
                  width="100%"
                  height="400"
                  src={video.youtube_link.replace('watch?v=', 'embed/')}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p>Video not available for this chapter yet.</p>
              </div>
            )}
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
        <div className="mt-8">
          <h3 className="text-xl mb-4">My Notes</h3>
          <div className="mb-4">
            <textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full p-2 border rounded"
              rows="3"
            />
            <button onClick={handleAddNote} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">Add Note</button>
          </div>
          <div className="space-y-2">
            {notes.map((note, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded">
                <p>{note.content}</p>
                <small className="text-gray-500">{new Date(note.timestamp).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterViewer;
