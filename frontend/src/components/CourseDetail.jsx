import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        setUser(userRes.data);
        const courseRes = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(courseRes.data);
      } catch (err) {
        console.log(err);
        setError('Failed to load data. Please check your connection.');
      }
    };
    fetchData();
  }, [id]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  if (!course || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 mb-4">
        <h1 className="text-2xl">{course.title}</h1>
        <Link to={`/courses?subject=${course.subject}`} className="text-white underline">Back to Courses</Link>
      </header>
      <div className="max-w-4xl mx-auto">
        <p className="mb-4">{course.description}</p>
        <h3 className="text-xl mb-4">Chapters</h3>
        <div className="space-y-4">
          {course.chapters && course.chapters.map(chapter => (
            <div key={chapter._id} className="bg-white p-4 rounded shadow">
              <h4 className="text-lg mb-2">{chapter.title}</h4>
              <p className="mb-4">{chapter.description}</p>
              <Link to={`/chapter/${chapter._id}`} className="bg-green-500 text-white px-4 py-2 rounded">Start Chapter</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
