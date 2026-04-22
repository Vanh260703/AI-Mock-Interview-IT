import { useEffect, useState, useRef } from 'react';
import { User, Mail, Shield, Camera, Pencil, Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store.js';
import { userApi } from '../../api/user.api.js';
import StatsGrid from '../../components/dashboard/StatsGrid.jsx';
import ProgressChart from '../../components/dashboard/ProgressChart.jsx';

// ─── Avatar Upload ─────────────────────────────────────────────────────────────
const AvatarSection = ({ user, onAvatarUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh tối đa 5MB');
      return;
    }

    // Preview tức thì
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await userApi.updateAvatar(fd);
      onAvatarUpdated(res.data.data.avatarUrl);
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Upload thất bại');
      setPreview(null);
    } finally {
      setUploading(false);
      // Reset input để có thể chọn lại cùng file
      e.target.value = '';
    }
  };

  const avatarSrc = preview ?? user?.avatar;
  const initials  = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="relative w-24 h-24 group">
      {/* Avatar */}
      {avatarSrc && !avatarSrc.includes('vecteezy') ? (
        <img
          src={avatarSrc}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-violet-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md">
          {initials}
        </div>
      )}

      {/* Overlay upload */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
      >
        {uploading
          ? <Loader2 className="w-6 h-6 text-white animate-spin" />
          : <Camera className="w-6 h-6 text-white" />
        }
      </button>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload badge */}
      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center border-2 border-white shadow cursor-pointer"
        onClick={() => inputRef.current?.click()}>
        <Camera size={12} className="text-white" />
      </div>
    </div>
  );
};

// ─── Edit Profile Form ─────────────────────────────────────────────────────────
const EditProfileForm = ({ user, onSaved, onCancel }) => {
  const [username, setUsername] = useState(user?.username ?? '');
  const [gender, setGender]     = useState(user?.gender ?? 'other');
  const [saving, setSaving]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      if (username.trim() !== (user?.username ?? '')) payload.username = username.trim();
      if (gender !== user?.gender) payload.gender = gender;

      if (!Object.keys(payload).length) {
        onCancel();
        return;
      }

      const res = await userApi.updateProfile(payload);
      onSaved(res.data.data.user);
      toast.success('Cập nhật thông tin thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      {/* Username */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nhập username..."
          maxLength={30}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Giới tính</label>
        <div className="flex gap-2">
          {[{ v: 'male', l: 'Nam' }, { v: 'female', l: 'Nữ' }, { v: 'other', l: 'Khác' }].map(({ v, l }) => (
            <button
              key={v}
              type="button"
              onClick={() => setGender(v)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                gender === v
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-100 text-gray-500 hover:border-gray-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-medium rounded-xl text-sm transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Lưu
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 hover:border-gray-300 rounded-xl text-sm transition-colors"
        >
          <X size={14} /> Huỷ
        </button>
      </div>
    </div>
  );
};

// ─── Profile Info (view mode) ─────────────────────────────────────────────────
const ProfileInfo = ({ user, onEdit }) => (
  <div className="flex-1 space-y-2">
    <div className="flex items-center gap-2">
      <User size={15} className="text-gray-400 shrink-0" />
      <span className="text-sm font-medium text-gray-800">{user?.username ?? <span className="text-gray-400 italic">Chưa đặt username</span>}</span>
    </div>
    <div className="flex items-center gap-2">
      <Mail size={15} className="text-gray-400 shrink-0" />
      <span className="text-sm text-gray-600">{user?.email}</span>
    </div>
    <div className="flex items-center gap-2">
      <Shield size={15} className="text-gray-400 shrink-0" />
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        user?.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
      }`}>{user?.role}</span>
      {user?.gender && user.gender !== 'other' && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
          {user.gender === 'male' ? 'Nam' : 'Nữ'}
        </span>
      )}
    </div>
    <button
      onClick={onEdit}
      className="mt-2 flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium"
    >
      <Pencil size={13} /> Chỉnh sửa thông tin
    </button>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, setSession, accessToken } = useAuthStore();
  const [localUser, setLocalUser] = useState(user);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    Promise.all([userApi.getMyStats(), userApi.getMyProgress({ days: 90 })])
      .then(([s, p]) => { setStats(s.data.data); setProgress(p.data.data.progress); })
      .catch(() => toast.error('Không thể tải dữ liệu'));
  }, []);

  const handleAvatarUpdated = (avatarUrl) => {
    const updated = { ...localUser, avatar: avatarUrl };
    setLocalUser(updated);
    setSession(updated, accessToken); // cập nhật store
  };

  const handleProfileSaved = (updatedUser) => {
    const merged = { ...localUser, ...updatedUser };
    setLocalUser(merged);
    setSession(merged, accessToken);
    setEditing(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h1>

      {/* User card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <AvatarSection user={localUser} onAvatarUpdated={handleAvatarUpdated} />

          {/* Info / Edit */}
          {editing ? (
            <EditProfileForm
              user={localUser}
              onSaved={handleProfileSaved}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <ProfileInfo user={localUser} onEdit={() => setEditing(true)} />
          )}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Thống kê tổng quan</h2>
        <StatsGrid stats={stats} />
      </div>

      {/* Progress 90 days */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Tiến độ 90 ngày</h2>
        <ProgressChart data={progress} days={90} />
      </div>
    </div>
  );
};

export default ProfilePage;
