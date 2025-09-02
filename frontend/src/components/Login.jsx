function Login() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl mb-4">Login to Gamified Learning Platform</h1>
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">Login with Google</button>
      </div>
    </div>
  );
}

export default Login;
