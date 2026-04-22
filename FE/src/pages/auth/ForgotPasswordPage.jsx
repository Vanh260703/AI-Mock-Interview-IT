import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api.js';

const schema = z.object({ email: z.string().email('Email không hợp lệ') });

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }) => {
    try {
      await authApi.forgotPassword({ email });
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Có lỗi xảy ra');
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Kiểm tra email của bạn</h3>
        <p className="text-sm text-gray-500 mb-6">Chúng tôi đã gửi link đặt lại mật khẩu vào email của bạn.</p>
        <Link to="/login" className="text-violet-600 text-sm hover:underline flex items-center justify-center gap-1">
          <ArrowLeft size={14} /> Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Quên mật khẩu</h2>
      <p className="text-sm text-gray-500 mb-6">Nhập email để nhận link đặt lại mật khẩu</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <button
          type="submit" disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
        >
          {isSubmitting && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
          Gửi link đặt lại
        </button>
      </form>

      <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-6">
        <ArrowLeft size={14} /> Quay lại đăng nhập
      </Link>
    </>
  );
};

export default ForgotPasswordPage;
