import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import styles from '../../styles/styles';

const ElementView = ({ element, isSelected, onClick, slotStatuses = {} }) => {
  const { type, style, meta } = element;
  if (type === 'slot') {
    // Get status color based on slot status
    const getStatusColor = (slotId) => {
      const status = slotStatuses[slotId] || meta.status || 'available';
      switch (status) {
        case 'available': return '#10b981'; // Green
        case 'occupied': return '#ef4444';  // Red
        case 'reserved': return '#f59e0b';  // Yellow
        default: return '#10b981';
      }
    };
    
    const statusColor = getStatusColor(meta.slotNumber || element.id);
    
    return (
      <div
        onClick={onClick}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: statusColor,
          border: '2px solid #374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          color: 'white',
          boxShadow: isSelected ? '0 0 0 2px #2563eb inset' : '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: 6,
          position: 'relative',
          cursor: 'pointer',
        }}
        title={`Slot ${meta.slotNumber || 'S1'} - ${slotStatuses[meta.slotNumber] || meta.status || 'available'}${meta.price ? ` - Lkr ${meta.price}/hr` : ''}`}
      >
        {/* Slot Number - Left Top Corner */}
        <div style={{ 
          position: 'absolute', 
          top: 4, 
          left: 4, 
          fontSize: 10,
          fontWeight: 600,
          color: 'white'
        }}>
          {meta.slotNumber || 'S1'}
        </div>
        

        
        {/* Price - Bottom Center */}
        {meta.price && (
          <div style={{ 
            position: 'absolute', 
            bottom: 4, 
            left: '50%', 
            transform: 'translateX(-50%)',
            fontSize: 9,
            fontWeight: 600,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '1px 4px',
            borderRadius: 3,
            whiteSpace: 'nowrap'
          }}>
             Rs{meta.price}/hr
          </div>
        )}
      </div>
    );
  }
  if (type === 'line') {
    return (
      <div
        onClick={onClick}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: style.backgroundColor,
          boxShadow: isSelected ? '0 0 0 2px #2563eb inset' : 'none',
          borderRadius: 4,
        }}
      />
    );
  }
  // label
  return (
    <div
      onClick={onClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: element.style.color,
        backgroundColor: element.style.backgroundColor,
        border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
        boxShadow: isSelected ? '0 0 0 2px #2563eb inset' : 'none',
        borderRadius: 6,
      }}
    >
      {element.meta.label || 'Label'}
    </div>
  );
};

const DesignerCanvas = ({
  elements,
  selectedId,
  onSelect,
  onChange,
  canvas,
  gridSize,
  snapToGrid,
  slotStatuses = {},
}) => {
  const gridStyle = {
    backgroundSize: `${gridSize}px ${gridSize}px`,
    backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
  };

  return (
    <div style={{ ...styles.analyticsCard, overflow: 'hidden' }}>
      <div style={{ marginBottom: 8, display: 'flex', gap: 12 }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Canvas: {canvas.width} × {canvas.height}px</div>
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: canvas.width,
            height: canvas.height,
            backgroundColor: canvas.backgroundColor,
            ...gridStyle,
          }}
        >
          {elements.map((el) => (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              onDragStop={(e, d) => onChange(el.id, { x: d.x, y: d.y })}
              onResizeStop={(e, dir, ref, delta, position) =>
                onChange(el.id, {
                  width: parseFloat(ref.style.width),
                  height: parseFloat(ref.style.height),
                  ...position,
                })
              }
              bounds="parent"
              enableResizing={{ top: true, right: true, bottom: true, left: true, topRight: true, bottomRight: true, bottomLeft: true, topLeft: true }}
              dragGrid={snapToGrid ? [gridSize, gridSize] : [1, 1]}
              resizeGrid={snapToGrid ? [gridSize, gridSize] : [1, 1]}
              style={{ 
                position: 'absolute', 
                transform: `rotate(${el.rotation}deg)`,
                transformOrigin: 'center center'
              }}
              onMouseDown={() => onSelect(el.id)}
            >
              <ElementView element={el} isSelected={selectedId === el.id} onClick={() => onSelect(el.id)} slotStatuses={slotStatuses} />
            </Rnd>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignerCanvas;




