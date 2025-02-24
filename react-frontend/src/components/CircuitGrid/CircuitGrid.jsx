import React, { useState } from 'react';
import { Grid, Move } from 'lucide-react';
import { useDrop } from 'react-dnd';
import './CircuitGrid.css';

const DropZone = ({ 
  onDrop, 
  columnIndex, 
  qubitIndex, 
  isSelecting, 
  onCnotSelect, 
  allowedColumn 
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'gate',
    drop: (item) => {
      if (item.type === 'CNOT' && !isSelecting) {
        onCnotSelect('control', qubitIndex, columnIndex);
      } else {
        onDrop(item.type, qubitIndex, columnIndex);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() })
  }));

  const isAllowed = isSelecting && columnIndex === allowedColumn;
  const isNotAllowed = isSelecting && columnIndex !== allowedColumn;

  return (
    <div
      ref={drop}
      className={`drop-zone 
        ${isOver ? 'drop-zone-active' : ''} 
        ${isSelecting ? 'cnot-selecting' : ''}
        ${isAllowed ? 'allowed-for-cnot' : ''}
        ${isNotAllowed ? 'not-allowed-drop' : ''}`}
      onClick={() => {
        if (isAllowed) {
          onCnotSelect('target', qubitIndex, columnIndex);
        }
      }}
    />
  );
};

const DroppedGate = ({ gateType, isControl, isTarget }) => {
  let displayText = gateType;
  if (gateType === 'CNOT') {
    displayText = isControl ? '•' : '⊕';
  }

  return (
    <div className={`gate-button ${isControl ? 'control-point' : ''} ${isTarget ? 'target-point' : ''}`}>
      {!isControl && !isTarget && <Move size={16} className="gate-icon" />}
      {displayText}
    </div>
  );
};

const CircuitGrid = ({ qubitCount, circuitState, onDropGate }) => {
  const [cnotSelection, setCnotSelection] = useState(null);

  const handleCnotSelect = (point, qubitIndex, columnIndex) => {
    if (point === 'control') {
      setCnotSelection({
        control: { qubit: qubitIndex, column: columnIndex },
        selecting: true
      });
    } else if (point === 'target' && cnotSelection) {
      onDropGate('CNOT', qubitIndex, columnIndex, {
        controlQubit: cnotSelection.control.qubit,
        controlColumn: cnotSelection.control.column
      });
      setCnotSelection(null);
    }
  };

  const isEmpty = Object.values(circuitState).every(
    (gates) => !gates || Object.keys(gates).length === 0
  );

  return (
    <div className="circuit-grid">
      <div className={`circuit-lines-container ${isEmpty ? 'is-empty' : ''}`}>
        {Array.from({ length: qubitCount }).map((_, qubitIndex) => (
          <div key={qubitIndex} className="qubit-line">
            <span className="qubit-label">Q{qubitIndex}</span>
            <div className="drop-zones-container">
              {Array.from({ length: 10 }).map((_, columnIndex) => (
                <div key={`${qubitIndex}-${columnIndex}`} className="drop-zone-wrapper">
                  <DropZone
                    qubitIndex={qubitIndex}
                    columnIndex={columnIndex}
                    onDrop={onDropGate}
                    isSelecting={cnotSelection?.selecting}
                    onCnotSelect={handleCnotSelect}
                    allowedColumn={cnotSelection?.control?.column}
                  />
                  {circuitState[qubitIndex]?.[columnIndex] && (
                    <div className="dropped-gate-container">
                      <DroppedGate 
                        gateType={circuitState[qubitIndex][columnIndex].type}
                        isControl={circuitState[qubitIndex][columnIndex].isControl}
                        isTarget={circuitState[qubitIndex][columnIndex].isTarget}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {isEmpty && (
          <div className="empty-state">
            <Grid size={48} className="empty-state-icon" />
            <p className="empty-state-text">Drag and drop gates here to build your circuit.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitGrid;
