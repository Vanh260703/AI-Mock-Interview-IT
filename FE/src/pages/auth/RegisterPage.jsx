import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api.js';
import { TARGET_OPTIONS, CAREER_LEVEL_OPTIONS } from '../../lib/constants.js';

const schema = z.object({
  email:    z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Mật khẩu không khớp', path: ['confirm'] });

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPw, setShowPw]       = useState(false);
  const [target, setTarget]       = useState(null);
  const [careerLevel, setCareerLevel] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    try {
      await authApi.register({ email, password, target, careerLevel });
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Đăng ký thất bại');
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Đăng ký</h2>
      <p className="text-sm text-gray-500 mb-6">Tạo tài khoản mới để bắt đầu luyện tập</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="email@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
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

        {/* Confirm */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
          <input
            {...register('confirm')}
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
          />
          {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm.message}</p>}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">Tuỳ chọn</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Target */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bạn đang hướng đến vị trí nào?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TARGET_OPTIONS.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTarget(target === value ? null : value)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-colors ${
                  target === value
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg leading-none">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Career Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level hiện tại của bạn?
          </label>
          <div className="flex gap-2">
            {CAREER_LEVEL_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCareerLevel(careerLevel === value ? null : value)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-colors ${
                  careerLevel === value
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 text-gray-500 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
        >
          {isSubmitting
            ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            : <UserPlus size={16} />
          }
          Đăng ký
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-violet-600 font-medium hover:underline">Đăng nhập</Link>
      </p>
    </>
  );
};

export default RegisterPage;
