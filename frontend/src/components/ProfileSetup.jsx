import { useState } from 'react';
import axios from 'axios';

function ProfileSetup({ user, onComplete }) {
  const availableSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
  const [form, setForm] = useState({
    username: user.username || '',
    age: user.age || '',
    class: user.class || '',
    subjects: user.subjects || []
  });

  const handleSubjectChange = (subject, checked) => {
    setForm(prev => ({
      ...prev,
      subjects: checked
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      subjects: form.subjects
    };
    try {
      await axios.post('http://localhost:5000/auth/update_profile', data, { withCredentials: true });
      onComplete();
    } catch (err) {
      console.log('Error updating profile:', err.response ? err.response.data : err.message);
      alert('Error updating profile: ' + (err.response ? err.response.data : err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl mb-4">Complete Your Profile</h1>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({...form, username: e.target.value})}
          className="block w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={e => setForm({...form, age: e.target.value})}
          className="block w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Class (1-12)"
          value={form.class}
          onChange={e => setForm({...form, class: e.target.value})}
          className="block w-full mb-2 p-2 border rounded"
          min="1"
          max="12"
          required
        />
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Subjects</label>
          {availableSubjects.map(subject => (
            <label key={subject} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={form.subjects.includes(subject)}
                onChange={e => handleSubjectChange(subject, e.target.checked)}
                className="mr-2"
              />
              {subject}
            </label>
          ))}
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Submit</button>
      </form>
    </div>
  );
}

export default ProfileSetup;