import React from 'react';
import { Move } from 'lucide-react';
import { useDrag } from 'react-dnd';
import './GatesSection.css';

const DraggableGate = ({ gate }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'gate',
    item: { type: gate },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`gate-button ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: 'move' }}
    >
      <Move size={16} className="gate-icon" />
      {gate}
    </div>
  );
};

const GatesSection = ({ title, gates }) => {
  return (
    <div className="gates-section">
      <h3 className="section-title">{title}</h3>
      <div className="gates-grid">
        {gates.map((gate) => (
          <DraggableGate key={gate} gate={gate} />
        ))}
      </div>
    </div>
  );
};

export default GatesSection;