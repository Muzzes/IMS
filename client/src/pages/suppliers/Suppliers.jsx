import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField from '../../components/common/FormField';
import FormInput from '../../components/common/FormInput';
import FormTextarea from '../../components/common/FormTextarea';
import { PageLoader } from '../../components/LoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Suppliers = () => {
  const { activeWorkspace } = useWorkspace();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const emptyForm = { name: '', email: '', phone: '', address: '', contact_name: '', city: '', notes: '' };
  const [form, setForm] = useState(emptyForm);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { document.title = 'Suppliers — IMS Pro'; }, []);

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data.data || []);
    } catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchSuppliers(); }, [activeWorkspace]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.name.trim().length < 2) errs.name = 'Minimum 2 characters';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
      if (editing) {
        await api.put(`/suppliers/${editing.id}`, trimmed);
        toast.success('Supplier updated');
      } else {
        await api.post('/suppliers', trimmed);
        toast.success('Supplier created');
      }
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setErrors({});
      fetchSuppliers();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setIsSubmitting(false); }
  };

  const handleEdit = (supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name || '', email: supplier.email || '',
      phone: supplier.phone || '', address: supplier.address || '',
      contact_name: supplier.contact_name || '', city: supplier.city || '',
      notes: supplier.notes || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/suppliers/${deleteTarget.id}`);
      toast.success('Supplier deleted');
      setDeleteTarget(null);
      fetchSuppliers();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const updateField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => (
      <div>
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{row.name}</span>
        {row.contact_name && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{row.contact_name}</p>}
      </div>
    )},
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'City', accessor: 'city', render: r => r.city || r.address?.split(',').pop()?.trim() || '—' },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px' }}>Suppliers</h1>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all"
                style={{ background: 'var(--accent-bright)' }}>
          <HiOutlinePlus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <DataTable columns={columns} data={suppliers} actions={(row) => (
        <>
          <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--accent-bright)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger-text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </>
      )} />

      {/* Supplier Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'New Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Company Name" required error={errors.name}>
            <FormInput value={form.name} onChange={e => updateField('name', e.target.value)} error={errors.name} placeholder="Supplier company name" />
          </FormField>
          <FormField label="Contact Person">
            <FormInput value={form.contact_name} onChange={e => updateField('contact_name', e.target.value)} placeholder="Primary contact name" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" error={errors.email}>
              <FormInput type="email" value={form.email} onChange={e => updateField('email', e.target.value)} error={errors.email} placeholder="email@example.com" />
            </FormField>
            <FormField label="Phone">
              <FormInput value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Phone number" />
            </FormField>
          </div>
          <FormField label="City">
            <FormInput value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="City" />
          </FormField>
          <FormField label="Address">
            <FormTextarea value={form.address} onChange={e => updateField('address', e.target.value)} rows={2} placeholder="Full address" />
          </FormField>
          <FormField label="Notes">
            <FormTextarea value={form.notes} onChange={e => updateField('notes', e.target.value)} rows={2} placeholder="Internal notes..." maxLength={500} />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'var(--accent-bright)' }}>
              {isSubmitting ? <><LoadingSpinner size="sm" /> Saving...</> : (editing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Supplier" message={`Delete "${deleteTarget?.name}"? This cannot be undone. Existing purchase orders will show "Deleted supplier".`}
        confirmText="Delete" danger loading={deleteLoading} />
    </div>
  );
};

export default Suppliers;
