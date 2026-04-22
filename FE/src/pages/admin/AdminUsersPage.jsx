import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import { formatDate } from '../../lib/constants.js';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/users', { params: { page, limit: 20 } })
      .then((res) => { setUsers(res.data.data); setPagination(res.data.pagination); })
      .catch(() => toast.error('Không thể tải danh sách người dùng'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Email', 'Username', 'Role', 'Xác thực', 'Ngày tạo'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(10).fill(0).map((_, i) => (
                <tr key={i}>{Array(5).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              ))
            ) : users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-800">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.username ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>{u.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">← Trước</button>
          <span className="text-sm text-gray-500">{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">Sau →</button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
