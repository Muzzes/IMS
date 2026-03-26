import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { PageLoader } from '../../../components/LoadingSpinner';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { HiOutlineArrowLeft, HiOutlineUserPlus, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [assignModal, setAssignModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignForm, setAssignForm] = useState({ user_id: '', access_level: 'full' });

  useEffect(() => { document.title = 'Workspace Details — IMS Pro'; }, []);

  const fetchData = useCallback(async () => {
    try {
      const [wsRes, usersRes, allUsersRes] = await Promise.all([
        api.get(`/workspaces/${id}`),
        api.get(`/workspaces/${id}/users`),
        api.get('/users') // Admin can fetch all users
      ]);
      setWorkspace(wsRes.data.workspace);
      setUsers(usersRes.data.users);
      // Ensure only active staff/manufacturer users can be added
      setAllUsers(allUsersRes.data.data.filter(u => u.is_active));
    } catch { toast.error('Failed to load data'); navigate('/settings/workspaces'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.user_id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(`/workspaces/${id}/users`, assignForm);
      toast.success('User assigned successfully');
      setAssignModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign user'); }
    finally { setIsSubmitting(false); }
  };

  const handleAccessChange = async (userId, access_level) => {
    try {
      await api.put(`/workspaces/${id}/users/${userId}`, { access_level });
      toast.success('Access level updated');
      fetchData();
    } catch { toast.error('Failed to update access'); }
  };

  const handleRevoke = async (userId) => {
    if (!confirm('Revoke access for this user?')) return;
    try {
      await api.delete(`/workspaces/${id}/users/${userId}`);
      toast.success('Access revoked');
      fetchData();
    } catch { toast.error('Failed to revoke'); }
  };

  if (loading) return <PageLoader />;
  if (!workspace) return null;

  // Filter out users already in workspace, and admins (admins have global access)
  const availableUsers = allUsers.filter(u => !users.some(wu => wu.id === u.id) && u.role !== 'admin');

  const columns = [
    { header: 'User', accessor: 'name', render: r => (
      <div><p className="font-semibold">{r.name}</p><p className="text-xs text-surface-500">{r.email}</p></div>
    )},
    { header: 'Role', accessor: 'role', render: r => <span className="capitalize">{r.role}</span> },
    { header: 'Access Level', accessor: 'access_level', render: r => (
      <select value={r.access_level} onChange={(e) => handleAccessChange(r.id, e.target.value)} 
              className="px-2 py-1 rounded-lg border dark:bg-surface-800 dark:border-surface-700 text-sm outline-none focus:ring-2 focus:ring-primary-500">
        <option value="full">Full Access</option>
        <option value="read_only">Read Only</option>
      </select>
    )}
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/settings/workspaces')} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition">
          <HiOutlineArrowLeft className="w-5 h-5 text-surface-500" />
        </button>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: workspace.color }}></span>
            {workspace.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{workspace.description || 'No description'}</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>Assigned Users</h3>
          <button onClick={() => { setAssignForm({ user_id: availableUsers[0]?.id || '', access_level: 'full' }); setAssignModal(true); }}
                  className="btn-primary flex items-center gap-2">
            <HiOutlineUserPlus className="w-4 h-4" /> Assign User
          </button>
        </div>

        <DataTable columns={columns} data={users} actions={(row) => (
          <button onClick={() => handleRevoke(row.id)} title="Revoke Access" className="p-1.5 hover:bg-rose-50 text-surface-400 hover:text-rose-600 rounded-lg transition">
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        )} />
      </div>

      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign User to Workspace">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Select User *</label>
            {availableUsers.length > 0 ? (
              <select value={assignForm.user_id} onChange={e => setAssignForm({...assignForm, user_id: e.target.value})} required className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">-- Choose User --</option>
                {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email} - {u.role})</option>)}
              </select>
            ) : <p className="text-sm text-amber-600 my-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">No available active users to assign. (Admins bypass assignments by default)</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Access Level</label>
            <select value={assignForm.access_level} onChange={e => setAssignForm({...assignForm, access_level: e.target.value})} className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500">
              <option value="full">Full Access</option>
              <option value="read_only">Read Only</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAssignModal(false)} className="px-4 py-2 rounded-lg border text-sm hover:bg-surface-50 dark:hover:bg-surface-800 dark:border-surface-700 transition">Cancel</button>
            <button type="submit" disabled={!assignForm.user_id || isSubmitting} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 transition">
              {isSubmitting ? <><LoadingSpinner size="sm" /> Assigning...</> : 'Assign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkspaceDetail;
