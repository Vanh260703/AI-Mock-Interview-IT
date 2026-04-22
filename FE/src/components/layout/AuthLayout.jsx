import { Outlet, Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-violet-700">
          <BrainCircuit className="w-8 h-8" />
          <span className="text-2xl font-bold">AI Mock Interview</span>
        </Link>
        <p className="text-sm text-gray-500 mt-1">Luyện phỏng vấn IT thông minh</p>
      </div>
      <div className="bg-white rounded-2xl shadow-xl shadow-violet-100 p-8">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
