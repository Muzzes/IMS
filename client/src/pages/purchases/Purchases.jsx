import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useWorkspace } from '../../context/WorkspaceContext';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import DispatchForm from './DispatchForm';
import { PageLoader } from '../../components/LoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  HiOutlineTruck, HiOutlineExclamationCircle, HiOutlineInboxArrowDown,
  HiOutlineChartBar, HiOutlineMap, HiOutlineUser, HiOutlinePhone, HiOutlinePlus,
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineDocumentText, HiOutlineArrowUturnRight,
  HiOutlineEye, HiOutlineTrash
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const Purchases = () => {
  const { activeWorkspace } = useWorkspace();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('all');
  const [trackingFocus, setTrackingFocus] = useState(null);

  // Fallback state for actually creating POs (kept simple for aesthetics)
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { document.title = 'Logistics & Fulfillment — IMS Pro'; }, []);

  const handleStatusUpdate = async (newStatus) => {
    if(!trackingFocus) return;
    try {
      await api.put(`/purchases/${trackingFocus.id}/status`, { status: newStatus });
      toast.success(`Status shifted to ${newStatus}`);
      fetchPurchases();
    } catch { toast.error('Status transition failed'); }
  };

  const handleDelete = async () => {
    if(!trackingFocus || !confirm('Permanently cancel and purge this movement? This action cannot be revoked.')) return;
    try {
      await api.delete(`/purchases/${trackingFocus.id}`);
      toast.success('Movement erased');
      setTrackingFocus(null);
      fetchPurchases();
    } catch { toast.error('Purge failed'); }
  };

  const fetchPurchases = async () => {
    try {
      const { data } = await api.get('/purchases');
      const loaded = data.data || [];
      setPurchases(loaded);
      
      // Auto-focus the first 'delivering' or 'pending' item for the tracking panel mockup
      if (loaded.length > 0) {
        const active = loaded.find(p => p.status === 'delivering') || loaded[0];
        setTrackingFocus(active);
      }
    } catch {
      toast.error('Failed to load logistics data');
    } finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchPurchases(); }, [activeWorkspace]);

  const filteredPurchases = purchases.filter(p => {
    if (activeTab === 'inbound') return p.status !== 'cancelled';
    if (activeTab === 'outbound') return false; // Not implemented in purchases, but kept for mockup styling
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'received': return <Badge variant="success"><HiOutlineCheckCircle className="w-3 h-3" /> SECURED</Badge>;
      case 'delivering': return <Badge variant="info"><HiOutlineTruck className="w-3 h-3 animate-pulse" /> EN ROUTE</Badge>;
      case 'pending': return <Badge variant="warning"><HiOutlineClock className="w-3 h-3" /> PROCESSING</Badge>;
      case 'cancelled': return <Badge variant="danger"><HiOutlineArrowUturnRight className="w-3 h-3" /> HALTED</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (loading) return <PageLoader />;

  const columns = [
    { header: 'TRACKING ID / REF', accessor: 'po_number', render: r => (
      <div>
        <span className="font-bold text-white font-mono">{r.po_number || `PO-${r.id.toString().padStart(6, '0')}`}</span>
        <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">AWB-82{r.id}992</div>
      </div>
    )},
    { header: 'DESTINATION / SOURCE', accessor: 'supplier_id', render: r => (
      <div>
        <span className="font-semibold text-white text-xs">{r.supplier_name || 'Global Core Industries'}</span>
        <div className="flex items-center gap-1 mt-0.5 text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-widest">
          <HiOutlineArrowUturnRight className="w-3 h-3 opacity-50 rotate-180" /> HUB CENTRAL, BERLIN
        </div>
      </div>
    )},
    { header: 'LOGISTICS PARTNER', accessor: 'id', render: () => (
      <span className="text-xs font-bold text-[var(--text-secondary)] tracking-wide">MAERSK GROUND</span>
    )},
    { header: 'ETA / DATE', accessor: 'order_date', render: r => {
      const d = new Date(r.order_date);
      d.setDate(d.getDate() + 3);
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      return (
        <div>
          <span className="font-bold font-mono text-white text-[13px]">{formatted}</span>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5 font-bold">14:00 CET</div>
        </div>
      );
    }},
    { header: 'STATUS', accessor: 'status', render: r => getStatusBadge(r.status) }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white mb-2">Logistics & Fulfillment</h1>
          <p className="text-[13px] text-[var(--text-secondary)] font-medium max-w-2xl">
            Real-time transit tracking, carrier performance, and inbound flow optimization.
          </p>
        </div>
        
        {/* Top Stats */}
        <div className="flex items-center gap-6 pb-2">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-1 flex items-center gap-1">
              <HiOutlineTruck className="w-3 h-3" /> ACTIVE SHIPMENTS
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight leading-none">842</span>
            </div>
          </div>
          <div className="w-px h-10 bg-[var(--border-subtle)]"></div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-1 flex items-center gap-1">
              <HiOutlineExclamationCircle className="w-3 h-3 text-[var(--danger-text)]" /> DELAYS/RETURNS
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--danger-text)] tracking-tight leading-none">12</span>
              <span className="text-[10px] font-bold text-[var(--danger-text)] uppercase">— Action Req</span>
            </div>
          </div>
          <div className="w-px h-10 bg-[var(--border-subtle)]"></div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-1 flex items-center gap-1">
              <HiOutlineInboxArrowDown className="w-3 h-3" /> INBOUND POs
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white tracking-tight leading-none">
                {formatCurrency(purchases.reduce((acc, p) => acc + p.total_amount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] min-h-[600px] flex flex-col">
            
            {/* Header + Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-4">
                <h3 className="text-[13px] font-bold tracking-widest text-white uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--success-text)] animate-pulse"></span>
                  Active Movements
                </h3>
                <div className="flex p-0.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-faint)] ml-4">
                  {['all', 'inbound', 'outbound'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                            className={`px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-md transition ${activeTab === t ? 'bg-[var(--accent-bright)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest uppercase">
                <HiOutlinePlus className="w-3 h-3" /> Dispatch Order
              </button>
            </div>

            {/* Table */}
            <div className="flex-1">
              <DataTable columns={columns} data={filteredPurchases} pageSize={10} onRowClick={(row) => setTrackingFocus(row)}
                         actions={(row) => (
                           <button onClick={(e) => { e.stopPropagation(); setTrackingFocus(row); }}
                                   className="p-1.5 text-[var(--accent-bright)] hover:bg-[var(--accent-glow)] rounded transition" title="Focus Tracking">
                             <HiOutlineEye className="w-4 h-4" />
                           </button>
                         )} />
            </div>

          </div>
        </div>

        {/* Sidebar Tracking Panel (Right 1/3) */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-xl border border-[var(--border-subtle)] relative overflow-hidden"
               style={{ background: 'linear-gradient(to bottom, #1e293b, var(--bg-surface))' }}>
            
            {/* Map Mockup Background */}
            <div className="absolute top-0 left-0 w-full h-40 bg-[var(--bg-base)] flex items-center justify-center border-b border-[var(--border-subtle)] opacity-40">
              <HiOutlineMap className="w-16 h-16 text-[var(--accent-bright)] opacity-20" />
              {/* Path line mockup */}
              <div className="absolute inset-0 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d" style={{ transform: 'rotateX(50deg) scale(1.5)' }}>
                  <path d="M 10 90 Q 50 10 90 90" fill="transparent" stroke="var(--accent-bright)" strokeWidth="0.5" strokeDasharray="2 1" className="opacity-50" />
                  <circle cx="90" cy="90" r="2" fill="var(--success-text)" />
                  <circle cx="10" cy="90" r="2" fill="var(--accent-bright)" />
                </svg>
              </div>
            </div>

            {trackingFocus ? (
              <div className="relative z-10 pt-32">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] uppercase bg-[var(--bg-elevated)] px-2 py-1 rounded border border-[var(--border-faint)]">
                    {trackingFocus.status === 'delivering' ? 'IN TRANSIT' : trackingFocus.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold font-mono text-[var(--accent-bright)]">{trackingFocus.po_number || `PO-${trackingFocus.id}`}</span>
                </div>
                
                <h3 className="text-xl font-bold tracking-tight text-white leading-none mb-1">
                  AWB-82{trackingFocus.id}992
                </h3>
                <p className="text-xs font-semibold text-[var(--text-secondary)] mb-6">Operated by Maersk Ground</p>

                {/* Action Controls */}
                <div className="flex items-center gap-2 mb-6">
                  {trackingFocus.status === 'pending' && (
                    <button onClick={() => handleStatusUpdate('delivering')} className="flex-1 py-1.5 rounded bg-[var(--info-bg)] text-[var(--info-text)] border border-[var(--info-text)] text-[10px] font-bold tracking-widest uppercase hover:brightness-110 transition">Dispatch Fleet</button>
                  )}
                  {trackingFocus.status === 'delivering' && (
                    <button onClick={() => handleStatusUpdate('received')} className="flex-1 py-1.5 rounded bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-text)] text-[10px] font-bold tracking-widest uppercase hover:brightness-110 transition">Record Arrival</button>
                  )}
                  {trackingFocus.status !== 'received' && trackingFocus.status !== 'cancelled' && (
                    <button onClick={() => handleStatusUpdate('cancelled')} className="px-3 py-1.5 rounded bg-[var(--danger-bg)] text-[var(--danger-text)] border border-[var(--danger-text)] text-[10px] font-bold tracking-widest uppercase hover:brightness-110 transition">Halt</button>
                  )}
                  <button onClick={handleDelete} className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--danger-text)] hover:bg-[var(--danger-bg)] transition" title="Purge Record">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>

                {/* Driver Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] mb-6">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-base)] flex items-center justify-center border border-[var(--border-faint)] text-white">
                    <HiOutlineUser className="w-5 h-5 opacity-50" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">Marek Z.</p>
                      <button className="text-[var(--text-secondary)] hover:text-white transition"><HiOutlinePhone className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="text-[10px] font-mono text-[var(--text-muted)]">License: B-49221-X</p>
                  </div>
                </div>

                {/* Timeline */}
                <h4 className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-4">TRANSIT TIMELINE</h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-[var(--border-strong)]">
                  
                  <div className="relative">
                    <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-subtle)] z-10">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-bright)] animate-pulse"></span>
                    </div>
                    <h5 className="text-[12px] font-bold text-white leading-none mb-1">Cleared Border Checkpoint</h5>
                    <p className="text-[10px] font-mono font-medium text-[var(--text-muted)]">Frankfurt Auth Zone 4</p>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mt-1 block">Tdy, 14:22 CET</span>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[var(--bg-base)] flex items-center justify-center border border-[var(--border-faint)] z-10">
                      <HiOutlineCheckCircle className="w-4 h-4 text-[var(--success-text)]" />
                    </div>
                    <h5 className="text-[12px] font-bold text-[var(--text-secondary)] leading-none mb-1">Dispatched from Source</h5>
                    <p className="text-[10px] font-mono font-medium text-[var(--text-muted)]">{trackingFocus.supplier_name || 'Global Core Industries'}</p>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mt-1 block">
                      {new Date(trackingFocus.order_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>

                   <div className="relative">
                    <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[var(--bg-base)] flex items-center justify-center border border-[var(--border-faint)] z-10">
                      <HiOutlineDocumentText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </div>
                    <h5 className="text-[12px] font-bold text-[var(--text-muted)] leading-none mb-1">Order Manifest Generated</h5>
                    <p className="text-[10px] font-mono font-medium text-[var(--text-muted)] opacity-50">System Entry</p>
                  </div>

                </div>

              </div>
            ) : (
              <div className="relative z-10 pt-48 pb-12 text-center">
                <p className="text-sm font-bold text-[var(--text-muted)]">Select an active movement<br/>to view live telemetry data.</p>
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <h3 className="text-[11px] font-bold tracking-widest text-[var(--danger-text)] uppercase mb-4 flex items-center gap-2">
              <HiOutlineExclamationCircle className="w-4 h-4" /> CRITICAL ALERTS
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[var(--danger-bg)] border border-[var(--danger-border)]">
                <h4 className="text-xs font-bold text-[var(--danger-text)] mb-1">Route Deviation Warning</h4>
                <p className="text-[11px] font-medium text-white/80 leading-snug">Shipment AWB-8240092 deviating from planned Euro-corridor. Carrier reports severe weather delay (+48h ETA impact).</p>
              </div>
            </div>
            
            <button className="w-full mt-4 py-2 bg-transparent text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase hover:text-white transition">
              Acknowledge Alert
            </button>
          </div>

        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Dispatch Request" size="lg">
        <DispatchForm onCancel={() => setModalOpen(false)} onSuccess={() => { setModalOpen(false); fetchPurchases(); }} />
      </Modal>

    </div>
  );
};

export default Purchases;
