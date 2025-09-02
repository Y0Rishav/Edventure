import { useState } from 'react';
import axios from 'axios';

function ProfileSetup({ user, onComplete }) {
  const [form, setForm] = useState({
    username: user.username || '',
    age: user.age || '',
    class: user.class || '',
    subjects: user.subjects ? user.subjects.join(', ') : ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      subjects: form.subjects.split(',').map(s => s.trim()).filter(s => s)
    };
    try {
      await axios.post('http://localhost:5000/auth/update_profile', data, { withCredentials: true });
      onComplete();
    } catch (err) {
      alert('Error updating profile');
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
        <input
          type="text"
          placeholder="Subjects (comma separated)"
          value={form.subjects}
          onChange={e => setForm({...form, subjects: e.target.value})}
          className="block w-full mb-4 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Submit</button>
      </form>
    </div>
  );
}

export default ProfileSetup;