import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { PageLoader } from '../../components/LoadingSpinner';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Suppliers = () => {
  const { activeWorkspace } = useWorkspace();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data.data || []);
    } catch (err) {
      toast.error('Failed to load suppliers');
    } finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchSuppliers(); }, [activeWorkspace]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/suppliers/${editing.id}`, form);
        toast.success('Supplier updated');
      } else {
        await api.post('/suppliers', form);
        toast.success('Supplier created');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ name: '', email: '', phone: '', address: '' });
      fetchSuppliers();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleEdit = (supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name, email: supplier.email || '',
      phone: supplier.phone || '', address: supplier.address || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success('Supplier deleted');
      fetchSuppliers();
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => <span className="font-semibold">{row.name}</span> },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Address', accessor: 'address', render: (row) => <span className="truncate max-w-xs">{row.address}</span> }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Suppliers</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', phone: '', address: '' }); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500
                           text-white text-sm font-semibold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <HiOutlinePlus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <DataTable columns={columns} data={suppliers} actions={(row) => (
        <>
          <button onClick={() => handleEdit(row)} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-primary-600 rounded-lg">
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-surface-500 hover:text-rose-600 rounded-lg">
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </>
      )} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'New Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                   className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                     className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                     className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Address</label>
            <textarea rows={3} value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border dark:bg-surface-800 dark:border-surface-700 outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
