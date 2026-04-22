import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api.js';

const schema = z.object({
  password: z.string().min(8, 'Tối thiểu 8 ký tự'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Mật khẩu không khớp', path: ['confirm'] });

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }) => {
    try {
      await authApi.resetPassword(token, { password });
      toast.success('Đặt lại mật khẩu thành công!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Link không hợp lệ hoặc đã hết hạn');
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Đặt lại mật khẩu</h2>
      <p className="text-sm text-gray-500 mb-6">Nhập mật khẩu mới của bạn</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <input
            {...register('password')} type="password" placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
          <input
            {...register('confirm')} type="password" placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
          />
          {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm.message}</p>}
        </div>
        <button
          type="submit" disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
        >
          <KeyRound size={16} /> Đặt lại mật khẩu
        </button>
      </form>
    </>
  );
};

export default ResetPasswordPage;
