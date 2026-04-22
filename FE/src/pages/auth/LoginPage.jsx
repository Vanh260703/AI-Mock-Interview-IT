import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api.js';
import { useAuthStore } from '../../store/auth.store.js';

const schema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc username'),
  password:   z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data);
      setSession(res.data.user, res.data.accessToken);
      toast.success(`Chào mừng trở lại, ${res.data.user.username ?? res.data.user.email}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Đăng nhập thất bại');
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h2>
      <p className="text-sm text-gray-500 mb-6">Chào mừng trở lại!</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email / Username</label>
          <input
            {...register('identifier')}
            type="text"
            placeholder="email@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
          />
          {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm pr-10"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-violet-600 hover:underline">Quên mật khẩu?</Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
        >
          {isSubmitting ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <LogIn size={16} />}
          Đăng nhập
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-violet-600 font-medium hover:underline">Đăng ký ngay</Link>
      </p>
    </>
  );
};

export default LoginPage;
