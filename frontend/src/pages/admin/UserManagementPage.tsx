import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './AdminDashboard';
import UserAvatar from '../../components/UserAvatar';
import type { User } from '../../context/AuthContext';
import { Plus, Pencil, Trash2, X, UserPlus, Search, Upload, Eye } from 'lucide-react';

const roles: User['role'][] = ['employee', 'manager', 'admin'];

const UserManagementPage: React.FC = () => {
  const { managedUsers, fetchUsers, addUser, updateUser, deleteUser, currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '123456', role: 'employee' as User['role'], department: '', status: 'Active' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState('');
  const [flash, setFlash] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = managedUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                         u.email.toLowerCase().includes(search.toLowerCase()) || 
                         u.role.includes(search.toLowerCase());
    if (currentUser?.role === 'manager') {
      return matchesSearch && u.role === 'employee';
    }
    return matchesSearch;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '123456', role: 'employee', department: '', status: 'Active' });
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, department: user.department, status: (user as any).status || 'Active' });
    setAvatarFile(null);
    setAvatarPreview(user.avatar ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatar}` : null);
    setFormError('');
    setShowModal(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.email.trim()) { setFormError('Name and email are required.'); return; }

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('email', form.email);
    fd.append('role', form.role);
    fd.append('department', form.department);
    fd.append('status', form.status);
    if (form.password) fd.append('password', form.password);
    if (avatarFile) fd.append('avatar', avatarFile);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, fd);
        setFlash(`✅ User "${form.name}" updated successfully.`);
      } else {
        if (!form.password) { setFormError('Password is required for new users.'); return; }
        await addUser(fd);
        setFlash(`✅ User "${form.name}" created successfully.`);
      }
      setShowModal(false);
      fetchUsers();
      setTimeout(() => setFlash(''), 4000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    const user = managedUsers.find((u) => u.id === id);
    try {
      await deleteUser(id);
      setConfirmDelete(null);
      setFlash(`🗑️ User "${user?.name}" deleted.`);
      setTimeout(() => setFlash(''), 4000);
    } catch (err: any) {
      setFlash(`❌ ${err.response?.data?.message || 'Delete failed'}`);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">User Management</h1>
          <p className="text-surface-500 mt-1">Create, edit, and manage system users.</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:brightness-110 transition-all">
          <Plus size={18} /> Add User
        </button>
      </div>

      {flash && (
        <div className="rounded-xl bg-success-400/10 border border-success-400/30 px-5 py-3 text-sm font-medium text-success-600 animate-scale-in">{flash}</div>
      )}

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full rounded-xl border border-surface-200 bg-white pl-10 pr-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-left">
                <th className="px-6 py-3 font-medium whitespace-nowrap">User</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Email</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Role</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Department</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Joined</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} />
                      <span className="font-medium text-surface-700 whitespace-nowrap">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-surface-500 whitespace-nowrap">{u.email}</td>
                  <td className="px-6 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-6 py-3 text-surface-500 whitespace-nowrap">{u.department}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${(u as any).status === 'Inactive' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {(u as any).status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-surface-400 whitespace-nowrap">{u.created_at}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setViewingUser(u); setShowViewModal(true); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors" title="View">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openEditModal(u)}
                        disabled={currentUser?.role === 'manager' && u.role !== 'employee'}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-primary-50 hover:text-primary-600 transition-colors disabled:opacity-30" title="Edit">
                        <Pencil size={15} />
                      </button>
                      {/* {u.id !== currentUser?.id && (
                        <button onClick={() => setConfirmDelete(u.id)}
                          disabled={currentUser?.role === 'manager' && u.role !== 'employee'}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-red-50 hover:text-danger-500 transition-colors disabled:opacity-30" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      )} */}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-surface-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-surface-200 animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600"><UserPlus size={18} /></div>
                <h3 className="text-lg font-semibold text-surface-800">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-100 text-surface-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-primary-500 shadow-lg" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-sm font-bold text-white shadow-inner border border-white/20">
                      {form.name ? form.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
                    </div>
                  )}
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 transition-colors">
                    <Upload size={14} /> Upload Avatar
                  </button>
                  <p className="text-[11px] text-surface-400 mt-1">JPG, PNG, WebP. Max 5MB</p>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nguyen Van A"
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@vingroup.net"
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Password {editingUser && <span className="text-surface-400">(leave blank to keep)</span>}</label>
                  <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingUser ? '••••••' : '123456'}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" {...(!editingUser ? { required: true } : {})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Role</label>
                  <select 
                    value={form.role} 
                    onChange={(e) => setForm({ ...form, role: e.target.value as User['role'] })}
                    disabled={currentUser?.role === 'manager'}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r} disabled={currentUser?.role === 'manager' && r !== 'employee'}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Department</label>
                  <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Engineering"
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {formError && <p className="text-sm text-danger-500 bg-danger-400/10 rounded-lg px-3 py-2">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:brightness-110 transition-all">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* View Details Modal */}
      {showViewModal && viewingUser && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-surface-200 animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <h3 className="text-lg font-semibold text-surface-800">User Profile</h3>
              <button onClick={() => setShowViewModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-100 text-surface-400"><X size={18} /></button>
            </div>
            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <UserAvatar user={viewingUser} size="h-24 w-24" />
                <h4 className="mt-4 text-xl font-bold text-surface-900">{viewingUser.name}</h4>
                <p className="text-surface-500">{viewingUser.email}</p>
                <div className="flex gap-2 mt-3">
                  <RoleBadge role={viewingUser.role} />
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${(viewingUser as any).status === 'Inactive' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {(viewingUser as any).status || 'Active'}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-surface-50">
                  <span className="text-surface-500 text-sm">Department</span>
                  <span className="text-surface-800 font-medium">{viewingUser.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-50">
                  <span className="text-surface-500 text-sm">Joined Date</span>
                  <span className="text-surface-800 font-medium">{new Date(viewingUser.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-50">
                  <span className="text-surface-500 text-sm">User ID</span>
                  <span className="text-surface-800 font-mono text-xs">{viewingUser.id}</span>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="mt-8 w-full rounded-xl bg-surface-100 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-200 transition-colors">Close</button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* Delete Confirmation */}
      {confirmDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-surface-200 animate-scale-in p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-danger-500 mx-auto mb-4"><Trash2 size={22} /></div>
            <h3 className="text-lg font-semibold text-surface-800 mb-2">Delete User?</h3>
            <p className="text-sm text-surface-500 mb-6">
              Are you sure you want to delete <strong>{managedUsers.find((u) => u.id === confirmDelete)?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="rounded-xl bg-danger-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-danger-600 transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default UserManagementPage;
