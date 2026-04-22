import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrainCircuit, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store.js';
import { userApi } from '../../api/user.api.js';

const VerifySuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession, setToken } = useAuthStore();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      setStatus('error');
      return;
    }

    const autoLogin = async () => {
      try {
        // Đặt token vào store trước để axios interceptor dùng được
        setToken(token);

        // Lấy full user profile
        const res = await userApi.getMe();
        setSession(res.data.data.user, token);

        setStatus('success');

        // Redirect sau 1.5s để user thấy màn hình success
        setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
      } catch {
        setStatus('error');
      }
    };

    autoLogin();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center space-y-5">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-7 h-7 text-violet-600" />
          </div>
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Đang xác thực...</p>
              <p className="text-sm text-gray-400 mt-1">Vui lòng chờ trong giây lát</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Xác thực thành công!</p>
              <p className="text-sm text-gray-400 mt-1">Đang chuyển hướng đến Dashboard...</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full animate-[progress_1.5s_linear_forwards]" />
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Link không hợp lệ</p>
              <p className="text-sm text-gray-400 mt-1">
                Link xác thực đã hết hạn hoặc không tồn tại.<br />
                Vui lòng đăng ký lại hoặc liên hệ hỗ trợ.
              </p>
            </div>
            <button
              onClick={() => navigate('/register', { replace: true })}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl text-sm transition-colors"
            >
              Quay lại đăng ký
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifySuccessPage;
