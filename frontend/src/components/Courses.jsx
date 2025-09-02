import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [searchParams] = useSearchParams();
  const subject = searchParams.get('subject');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        setUser(userRes.data);
        if (userRes.data && subject) {
          const coursesRes = await axios.get(`http://localhost:5000/api/courses?subject=${subject}&class=${userRes.data.class}`);
          setCourses(coursesRes.data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [subject]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 mb-4">
        <h1 className="text-2xl">Courses for {subject}</h1>
        <Link to="/dashboard" className="text-white underline">Back to Dashboard</Link>
      </header>
      <div className="max-w-4xl mx-auto">
        {courses.length === 0 ? (
          <p>No courses available for this subject yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(course => (
              <div key={course._id} className="bg-white p-4 rounded shadow">
                <h3 className="text-xl mb-2">{course.title}</h3>
                <p className="mb-4">{course.description}</p>
                <Link to={`/course/${course._id}`} className="bg-blue-500 text-white px-4 py-2 rounded">View Course</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;
