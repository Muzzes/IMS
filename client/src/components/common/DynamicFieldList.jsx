import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';

const DynamicFieldList = ({
  fields = [],
  onAdd,
  onRemove,
  onUpdate,
  renderField,
  addLabel = 'Add Row',
  minRows = 0,
  maxRows = 50,
}) => {
  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={index} className="flex items-end gap-2 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-faint)' }}>
          <div className="flex-1">
            {renderField(field, index, (key, value) => onUpdate(index, key, value))}
          </div>
          {fields.length > minRows && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 rounded-lg transition shrink-0 mb-0.5"
              style={{ color: 'var(--danger-text)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {fields.length < maxRows && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-sm font-medium transition px-3 py-2 rounded-lg"
          style={{ color: 'var(--accent-bright)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <HiOutlinePlus className="w-4 h-4" /> {addLabel}
        </button>
      )}
    </div>
  );
};

export default DynamicFieldList;
