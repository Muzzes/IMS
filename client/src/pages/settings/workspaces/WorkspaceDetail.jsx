import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import Badge from '../../../components/Badge';
import { PageLoader } from '../../../components/LoadingSpinner';
import { HiOutlineArrowLeft, HiOutlineUserPlus, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // for dropdown
  const [loading, setLoading] = useState(true);
  
  const [assignModal, setAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ user_id: '', access_level: 'full' });

  const fetchData = async () => {
    try {
      const [wsRes, usersRes, allUsersRes] = await Promise.all([
        api.get(`/workspaces/${id}`),
        api.get(`/workspaces/${id}/users`),
        api.get('/users') // Admin can fetch all users
      ]);
      setWorkspace(wsRes.data.workspace);
      setUsers(usersRes.data.users);
      setAllUsers(allUsersRes.data.data);
    } catch (err) { toast.error('Failed to load data'); navigate('/settings/workspaces'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/workspaces/${id}/users`, assignForm);
      toast.success('User assigned successfully');
      setAssignModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign user'); }
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

  const availableUsers = allUsers.filter(u => !users.some(wu => wu.id === u.id) && u.role !== 'admin');

  const columns = [
    { header: 'User', accessor: 'name', render: r => (
      <div><p className="font-semibold">{r.name}</p><p className="text-xs text-surface-500">{r.email}</p></div>
    )},
    { header: 'Role', accessor: 'role', render: r => <span className="capitalize">{r.role}</span> },
    { header: 'Access Level', accessor: 'access_level', render: r => (
      <select value={r.access_level} onChange={(e) => handleAccessChange(r.id, e.target.value)} 
              className="px-2 py-1 rounded border dark:bg-surface-800 dark:border-surface-700 text-sm outline-none focus:ring-1 focus:ring-primary-500">
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: workspace.color }}></span>
            {workspace.name}
          </h1>
          <p className="text-sm text-surface-500">{workspace.description || 'No description'}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 border border-surface-200 dark:border-surface-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-surface-900 dark:text-white">Assigned Users</h3>
          <button onClick={() => { setAssignForm({ user_id: availableUsers[0]?.id || '', access_level: 'full' }); setAssignModal(true); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-sm font-medium transition">
            <HiOutlineUserPlus className="w-4 h-4 text-primary-600" /> Assign User
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
            ) : <p className="text-sm text-amber-600">No available users to assign. (Admins bypass assignments)</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Access Level</label>
            <select value={assignForm.access_level} onChange={e => setAssignForm({...assignForm, access_level: e.target.value})} className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500">
              <option value="full">Full Access</option>
              <option value="read_only">Read Only</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAssignModal(false)} className="px-4 py-2 rounded-lg border text-sm hover:bg-surface-50">Cancel</button>
            <button type="submit" disabled={!assignForm.user_id} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50">Assign</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkspaceDetail;
