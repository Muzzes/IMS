import { useState, useEffect, useCallback } from 'react';
import FormField from '../../components/common/FormField';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineCog6Tooth, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const defaults = {
  company_name: 'IMS Pro',
  currency_symbol: '$',
  currency_code: 'USD',
  default_tax_rate: 13,
  low_stock_threshold: 10,
  date_format: 'MM/DD/YYYY',
  timezone: 'UTC',
};

const SystemSettings = () => {
  const [settings, setSettings] = useState(defaults);
  const [original, setOriginal] = useState(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'System Settings — IMS Pro'; }, []);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ims_system_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      setOriginal(parsed);
    }
  }, []);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleSave = async () => {
    if (!settings.company_name.trim()) { toast.error('Company name is required'); return; }
    if (!settings.currency_symbol.trim()) { toast.error('Currency symbol is required'); return; }
    if (settings.default_tax_rate < 0 || settings.default_tax_rate > 100) { toast.error('Tax rate must be 0-100'); return; }
    if (settings.low_stock_threshold < 1) { toast.error('Threshold must be at least 1'); return; }

    setSaving(true);
    try {
      // Persist to localStorage (mock backend)
      localStorage.setItem('ims_system_settings', JSON.stringify(settings));
      setOriginal({ ...settings });
      toast.success('Settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const updateField = (field, value) => {
    setSettings(s => ({ ...s, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-accent)' }}>
            <HiOutlineCog6Tooth className="w-5 h-5" style={{ color: 'var(--accent-bright)' }} />
          </div>
          <div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.5px' }}>System Settings</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Configure global application preferences</p>
          </div>
        </div>
        {isDirty && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid var(--warning-text)' }}>
              <HiOutlineExclamationTriangle className="w-3.5 h-3.5" /> Unsaved changes
            </span>
          </div>
        )}
      </div>

      {/* Company Info */}
      <div className="p-6 rounded-2xl space-y-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Company Information</h2>
        <FormField label="Company Name" required>
          <FormInput value={settings.company_name} onChange={e => updateField('company_name', e.target.value)} placeholder="Your company name" />
        </FormField>
      </div>

      {/* Currency & Tax */}
      <div className="p-6 rounded-2xl space-y-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Currency & Tax</h2>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Currency Symbol" required hint="e.g. $, £, ₹">
            <FormInput value={settings.currency_symbol} onChange={e => updateField('currency_symbol', e.target.value)} />
          </FormField>
          <FormField label="Currency Code" hint="e.g. USD, GBP, NPR">
            <FormInput value={settings.currency_code} onChange={e => updateField('currency_code', e.target.value)} />
          </FormField>
        </div>
        <FormField label="Default Tax Rate (%)" required hint="Applied as default to new bills and sales">
          <FormInput type="number" min="0" max="100" step="0.01" value={settings.default_tax_rate}
                     onChange={e => updateField('default_tax_rate', parseFloat(e.target.value) || 0)} suffix="%" />
        </FormField>
      </div>

      {/* Inventory */}
      <div className="p-6 rounded-2xl space-y-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Inventory</h2>
        <FormField label="Low Stock Threshold" required hint="Products below this level will trigger alerts">
          <FormInput type="number" min="1" max="9999" value={settings.low_stock_threshold}
                     onChange={e => updateField('low_stock_threshold', parseInt(e.target.value) || 1)} />
        </FormField>
      </div>

      {/* Display */}
      <div className="p-6 rounded-2xl space-y-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Display Preferences</h2>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date Format">
            <FormSelect value={settings.date_format} onChange={e => updateField('date_format', e.target.value)}
                        options={[
                          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                        ]} />
          </FormField>
          <FormField label="Timezone">
            <FormSelect value={settings.timezone} onChange={e => updateField('timezone', e.target.value)}
                        options={[
                          { value: 'UTC', label: 'UTC' },
                          { value: 'America/New_York', label: 'Eastern Time (ET)' },
                          { value: 'America/Chicago', label: 'Central Time (CT)' },
                          { value: 'America/Denver', label: 'Mountain Time (MT)' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                          { value: 'Europe/London', label: 'London (GMT)' },
                          { value: 'Europe/Paris', label: 'Central European (CET)' },
                          { value: 'Asia/Kolkata', label: 'India (IST)' },
                          { value: 'Asia/Kathmandu', label: 'Nepal (NPT)' },
                          { value: 'Asia/Tokyo', label: 'Japan (JST)' },
                          { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
                        ]} />
          </FormField>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pb-8">
        <button onClick={handleSave} disabled={!isDirty || saving}
                className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg transition-all"
                style={{ background: isDirty ? 'var(--accent-bright)' : 'var(--text-muted)' }}>
          {saving ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;
