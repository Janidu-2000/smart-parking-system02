import React, { useMemo, useState, useEffect } from 'react';
import styles from '../../styles/styles';

const Input = ({ label, type = 'text', value, onChange, step = '1', isMobile }) => (
  <div style={{ 
    ...styles.formGroup, 
    display: 'flex', 
    flexDirection: 'column',
    marginBottom: isMobile ? 8 : 12,
    width: '100%'
  }}>
    <label style={{ 
      ...styles.label, 
      fontSize: isMobile ? 12 : 14,
      marginBottom: isMobile ? 4 : 6,
      display: 'block'
    }}>{label}</label>
    <input
      type={type}
      value={value}
      step={step}
      onChange={(e) => onChange(e.target.value)}
      style={{ 
        ...styles.input, 
        width: '100%',
        maxWidth: '100%',
        fontSize: isMobile ? 12 : 14,
        padding: isMobile ? '6px 8px' : '8px 12px',
        boxSizing: 'border-box'
      }}
    />
  </div>
);

const ColorInput = ({ label, value, onChange, isMobile, compact = false }) => (
  <div style={{ 
    ...styles.formGroup, 
    display: 'flex', 
    flexDirection: 'column',
    marginBottom: isMobile ? 8 : 12,
    width: compact ? '48%' : '100%'
  }}>
    <label style={{ 
      ...styles.label, 
      fontSize: isMobile ? 12 : 14,
      marginBottom: isMobile ? 4 : 6,
      display: 'block'
    }}>{label}</label>
    <input 
      type="color" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      style={{ 
        width: isMobile ? '40px' : '50px',
        height: isMobile ? '30px' : '35px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        cursor: 'pointer',
        alignSelf: 'flex-start'
      }}
    />
  </div>
);

const PropertiesPanel = ({ element, updateElement, updateStyle, updateMeta, deleteElement, onSave, onSaveAndClose, rotateElement }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSlot = element?.type === 'slot';
  const isLine = element?.type === 'line';
  const isLabel = element?.type === 'label';

  const title = useMemo(() => {
    if (!element) return 'No selection';
    return `${element.type?.toUpperCase()} (${element.id.slice(-6)})`;
  }, [element]);

  if (!element) {
    return (
      <div style={{ 
        ...styles.controlsPanel, 
        maxWidth: '100%', 
        boxSizing: 'border-box',
        padding: isMobile ? '16px' : '24px'
      }}>
        <div style={{ color: '#6b7280', fontSize: isMobile ? 14 : 16 }}>Select an element to edit its properties</div>
      </div>
    );
  }

  return (
    <div style={{ 
      ...styles.controlsPanel, 
      maxWidth: '100%', 
      boxSizing: 'border-box',
      overflow: 'hidden',
      padding: isMobile ? '16px' : '24px',
      display: 'flex',
      flexDirection: 'column',
      height: 'fit-content'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: isMobile ? 8 : 12, 
        flexWrap: 'wrap', 
        gap: 8 
      }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: isMobile ? 12 : 14,
          wordBreak: 'break-word'
        }}>{title}</div>
      </div>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        maxWidth: '100%',
        flex: 1
      }}>
        <Input label="X" type="number" value={element.x} onChange={(v) => updateElement(element.id, { x: Number(v) })} isMobile={isMobile} />
        <Input label="Y" type="number" value={element.y} onChange={(v) => updateElement(element.id, { y: Number(v) })} isMobile={isMobile} />
        <Input label="Width" type="number" value={element.width} onChange={(v) => updateElement(element.id, { width: Number(v) })} isMobile={isMobile} />
        <Input label="Height" type="number" value={element.height} onChange={(v) => updateElement(element.id, { height: Number(v) })} isMobile={isMobile} />
        {isSlot && <Input label="Slot Number" value={element.meta.slotNumber} onChange={(v) => updateMeta(element.id, { slotNumber: v })} isMobile={isMobile} />}
        {isSlot && <Input label="Location" value={element.meta.location || ''} onChange={(v) => updateMeta(element.id, { location: v })} isMobile={isMobile} />}
        {isSlot && <Input label="Price per Hour ($)" type="number" step="0.01" value={element.meta.price || 0} onChange={(v) => updateMeta(element.id, { price: Number(v) })} isMobile={isMobile} />}
        {isLabel && <Input label="Text" value={element.meta.label} onChange={(v) => updateMeta(element.id, { label: v })} isMobile={isMobile} />}
        
        {/* Color inputs in same row */}
        <div style={{ display: 'flex', gap: isMobile ? 8 : 12, marginBottom: isMobile ? 8 : 12 }}>
          <ColorInput label="Fill" value={element.style.backgroundColor} onChange={(v) => updateStyle(element.id, { backgroundColor: v })} isMobile={isMobile} compact={true} />
          <ColorInput label="Border" value={element.style.borderColor} onChange={(v) => updateStyle(element.id, { borderColor: v })} isMobile={isMobile} compact={true} />
        </div>
        
        {/* Rotation slider */}
        <div style={{ 
          ...styles.formGroup, 
          display: 'flex', 
          flexDirection: 'column',
          marginBottom: isMobile ? 8 : 12,
          width: '100%'
        }}>
          <label style={{ 
            ...styles.label, 
            fontSize: isMobile ? 12 : 14,
            marginBottom: isMobile ? 4 : 6,
            display: 'block'
          }}>Rotation: {element.rotation}°</label>
          <input
            type="range"
            min="0"
            max="359"
            value={element.rotation}
            onChange={(e) => rotateElement(element.id, Number(e.target.value))}
            style={{ 
              width: '100%',
              height: isMobile ? '6px' : '8px',
              borderRadius: '4px',
              background: '#e5e7eb',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>
      <div style={{ 
        marginTop: isMobile ? 16 : 20,
        paddingTop: isMobile ? 12 : 16,
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          gap: isMobile ? 8 : 12,
          width: '100%'
        }}>
          <button style={{ 
            ...styles.button, 
            backgroundColor: '#2563eb', 
            fontSize: isMobile ? 11 : 12, 
            padding: isMobile ? '8px 12px' : '10px 16px',
            flex: 1,
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex'
          }} onClick={onSaveAndClose}>Save</button>
          <button style={{ 
            ...styles.button, 
            backgroundColor: '#ef4444', 
            fontSize: isMobile ? 11 : 12, 
            padding: isMobile ? '8px 12px' : '10px 16px',
            flex: 1,
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex'
          }} onClick={() => deleteElement(element.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;




