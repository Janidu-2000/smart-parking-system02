import React from 'react';
import { Copy, Clipboard, Copy as Duplicate } from 'lucide-react';
import styles from '../../styles/styles';

const toolbarButton = {
  ...styles.button,
  backgroundColor: '#111827',
};

const DesignerToolbar = ({ onAddSlot, onAddLine, onAddLabel, onSave, onLoad, onClear, onCopy, onPaste, onDuplicate, saveState, hasSelection }) => {
  return (
    <div style={{ ...styles.controlsPanel, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button style={toolbarButton} onClick={onAddSlot}>Add Slot</button>
        <button style={toolbarButton} onClick={onAddLine}>Add Line</button>
        <button style={toolbarButton} onClick={onAddLabel}>Add Label</button>
        <div style={{ flex: 1 }} />
        <button 
          style={{ ...toolbarButton, opacity: hasSelection ? 1 : 0.5, cursor: hasSelection ? 'pointer' : 'not-allowed' }} 
          onClick={onCopy}
          disabled={!hasSelection}
        >
          <Copy size={16} />
          Copy
        </button>
        <button style={toolbarButton} onClick={onPaste}>
          <Clipboard size={16} />
          Paste
        </button>
        <button 
          style={{ ...toolbarButton, opacity: hasSelection ? 1 : 0.5, cursor: hasSelection ? 'pointer' : 'not-allowed' }} 
          onClick={onDuplicate}
          disabled={!hasSelection}
        >
          <Duplicate size={16} />
          Duplicate
        </button>
        <div style={{ flex: 1 }} />
        <button style={styles.button} onClick={onSave} disabled={saveState === 'saving'}>
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save'}
        </button>
        <button style={{ ...styles.button, backgroundColor: '#374151' }} onClick={onLoad}>Load</button>
        <button style={{ ...styles.button, backgroundColor: '#ef4444' }} onClick={onClear}>Clear</button>
      </div>
    </div>
  );
};

export default DesignerToolbar;




