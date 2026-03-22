import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { PageLoader } from '../../../components/LoadingSpinner';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineBuildingStorefront } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const WorkspaceList = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });

  const fetchWorkspaces = async () => {
    try {
      const { data } = await api.get('/workspaces');
      setWorkspaces(data.workspaces || []);
    } catch { toast.error('Failed to load workspaces'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWorkspaces(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workspaces', form);
      toast.success('Workspace created');
      setModalOpen(false);
      setForm({ name: '', description: '', color: '#6366f1' });
      fetchWorkspaces();
      // force reload context
      window.dispatchEvent(new Event('workspace-change'));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Workspace', accessor: 'name', render: w => (
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: w.color + '20' }}>
          <HiOutlineBuildingStorefront className="w-4 h-4" style={{ color: w.color }} />
        </span>
        <span className="font-semibold text-surface-900 dark:text-white">{w.name}</span>
      </div>
    )},
    { header: 'Description', accessor: 'description', render: w => <span className="text-surface-500 truncate max-w-sm">{w.description || '-'}</span> },
    { header: 'Created', accessor: 'created_at', render: w => new Date(w.created_at).toLocaleDateString() }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Manage Workspaces</h1>
        <button onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all">
          <HiOutlinePlus className="w-4 h-4" /> New Workspace
        </button>
      </div>

      <DataTable columns={columns} data={workspaces} actions={(row) => (
        <Link to={`/settings/workspaces/${row.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition">
          <HiOutlinePencil className="w-4 h-4" /> Manage
        </Link>
      )} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Workspace">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Company / Workspace Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Brand Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-10 h-10 p-1 rounded cursor-pointer bg-white dark:bg-surface-800 border dark:border-surface-700" />
              <input type="text" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-32 px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm uppercase" pattern="^#[0-9A-Fa-f]{6}$" title="Hex color code (e.g. #FF0000)" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border dark:border-surface-700 text-sm font-medium hover:bg-surface-50">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkspaceList;
