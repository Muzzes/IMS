import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import ConfirmDialog from '../../../components/ConfirmDialog';
import FormField from '../../../components/common/FormField';
import FormInput from '../../../components/common/FormInput';
import FormSelect from '../../../components/common/FormSelect';
import { PageLoader } from '../../../components/LoadingSpinner';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineUserMinus, HiOutlineUserPlus } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Badge from '../../../components/Badge';

const emptyForm = { name: '', email: '', password: '', role: 'staff', workspace_id: '' };

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Delete / Deactivate
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);

  // Role change
  const [roleChangeTarget, setRoleChangeTarget] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => { document.title = 'Manage Users — IMS Pro'; }, []);

  const fetchData = async () => {
    try {
      const [resUsers, resWorkspaces] = await Promise.all([
        api.get('/users?limit=100'),
        api.get('/workspaces'),
      ]);
      setUsers(resUsers.data.data || []);
      setWorkspaces(resWorkspaces.data.workspaces || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password || form.password.length < 6) errs.password = 'Min 6 characters';
    if (!form.workspace_id) errs.workspace_id = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', form);
      toast.success('User created and assigned successfully.');
      setModalOpen(false);
      setForm(emptyForm);
      setErrors({});
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create user'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchData();
    } catch { toast.error('Failed to delete user'); }
  };

  const handleDeactivate = async () => {
    if (!deactivateConfirm) return;
    try {
      const isActive = deactivateConfirm.is_active;
      await api.put(`/users/${deactivateConfirm.id}`, { is_active: !isActive });
      toast.success(`User ${isActive ? 'deactivated' : 'reactivated'}`);
      setDeactivateConfirm(null);
      fetchData();
    } catch { toast.error('Failed to update user status'); }
  };

  const handleRoleChange = async () => {
    if (!roleChangeTarget || !newRole) return;
    try {
      await api.put(`/users/${roleChangeTarget.id}`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      setRoleChangeTarget(null);
      setNewRole('');
      fetchData();
    } catch { toast.error('Failed to change role'); }
  };

  const startRoleChange = (user, role) => {
    if (role === user.role) return;
    setRoleChangeTarget(user);
    setNewRole(role);
  };

  const updateField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const columns = [
    { header: 'Name', accessor: 'name', render: u => <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</span> },
    { header: 'Email', accessor: 'email', render: u => <span style={{ color: 'var(--text-secondary)' }}>{u.email}</span> },
    { header: 'Role', accessor: 'role', render: u => (
      u.role === 'admin' ? <Badge variant="danger">{u.role}</Badge> : (
        <select value={u.role} onChange={e => startRoleChange(u, e.target.value)}
                className="px-2 py-1 text-xs font-medium rounded-lg outline-none cursor-pointer"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)', color: 'var(--accent-bright)' }}>
          <option value="staff">staff</option>
          <option value="manufacturer">manufacturer</option>
        </select>
      )
    )},
    { header: 'Status', accessor: 'is_active', render: u => <Badge variant={u.is_active ? 'success' : 'neutral'}>{u.is_active ? 'Active' : 'Inactive'}</Badge> },
    { header: 'Joined', accessor: 'created_at', render: u => <span style={{ color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</span> },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px' }}>Manage Users</h1>
        <button onClick={() => { setForm(emptyForm); setErrors({}); setModalOpen(true); }}
                className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Create User
        </button>
      </div>

      <DataTable columns={columns} data={users} actions={(row) => (
        row.role !== 'admin' && (
          <div className="flex items-center gap-1">
            <button onClick={() => setDeactivateConfirm(row)} title={row.is_active ? 'Deactivate' : 'Reactivate'}
                    className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = row.is_active ? 'var(--warning-bg)' : 'var(--success-bg)'; e.currentTarget.style.color = row.is_active ? 'var(--warning-text)' : 'var(--success-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {row.is_active ? <HiOutlineUserMinus className="w-4 h-4" /> : <HiOutlineUserPlus className="w-4 h-4" />}
            </button>
            <button onClick={() => setDeleteTarget(row)} title="Delete User"
                    className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>
        )
      )} />

      {/* Create User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New User" size="md">
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <FormField label="Full Name" required error={errors.name}>
            <FormInput value={form.name} onChange={e => updateField('name', e.target.value)} error={errors.name} placeholder="John Doe" />
          </FormField>
          <FormField label="Email Address" required error={errors.email}>
            <FormInput type="email" value={form.email} onChange={e => updateField('email', e.target.value)} error={errors.email} placeholder="john@example.com" />
          </FormField>
          <FormField label="Temporary Password" required error={errors.password}>
            <FormInput type="password" value={form.password} onChange={e => updateField('password', e.target.value)} error={errors.password} placeholder="At least 6 characters" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role" required>
              <FormSelect value={form.role} onChange={e => updateField('role', e.target.value)}
                          options={[{ value: 'staff', label: 'Staff' }, { value: 'manufacturer', label: 'Manufacturer' }]} />
            </FormField>
            <FormField label="Assign Company" required error={errors.workspace_id}>
              <FormSelect value={form.workspace_id} onChange={e => updateField('workspace_id', e.target.value)}
                          options={workspaces.map(w => ({ value: w.id, label: w.name }))} error={errors.workspace_id} placeholder="Choose Company" />
            </FormField>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', marginTop: '12px' }}>
            User will be isolated to the chosen company and cannot switch between companies.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting || !form.workspace_id}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'var(--accent-bright)' }}>
              {isSubmitting ? <><LoadingSpinner size="sm" /> Creating...</> : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialogs */}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete User" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete" danger />

      <ConfirmDialog isOpen={!!deactivateConfirm} onClose={() => setDeactivateConfirm(null)} onConfirm={handleDeactivate}
        title={deactivateConfirm?.is_active ? 'Deactivate User' : 'Reactivate User'}
        message={deactivateConfirm?.is_active
          ? `Deactivate "${deactivateConfirm?.name}"? They will be logged out and cannot log back in.`
          : `Reactivate "${deactivateConfirm?.name}"? They will be able to log in again.`}
        confirmText={deactivateConfirm?.is_active ? 'Deactivate' : 'Reactivate'}
        danger={!!deactivateConfirm?.is_active} />

      <ConfirmDialog isOpen={!!roleChangeTarget} onClose={() => setRoleChangeTarget(null)} onConfirm={handleRoleChange}
        title="Change Role"
        message={`Change ${roleChangeTarget?.name}'s role to "${newRole}"?`}
        confirmText="Change Role" danger={false} />
    </div>
  );
};

export default UsersList;
