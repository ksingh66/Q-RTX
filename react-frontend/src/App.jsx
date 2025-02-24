import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  BookOpen, 
  HelpCircle, 
  Play, 
  Save,
  Trash2,
  Grid,
  Plus,
  Minus,
  Check,
  Move
} from 'lucide-react';
import { ControlBar, Header, GatesSection, ResourceUsage, CircuitGrid } from "./components";

const QuantumUI = () => {
  const [selectedQubitCount, setSelectedQubitCount] = useState(5);
  const [confirmedQubitCount, setConfirmedQubitCount] = useState(5);
  const [circuitState, setCircuitState] = useState({});

  const handleConfirm = () => {
    setConfirmedQubitCount(selectedQubitCount);
    console.log('Confirmed qubit count:', selectedQubitCount);
  };
  const handleClear = () => {
    setCircuitState({}); // Reset circuit state to empty object
    console.log('Circuit cleared');
  }; 

  const handleDropGate = (gateType, qubitIndex, columnIndex, cnotData) => { // Add 4th param
    setCircuitState(prev => {
      const newState = { ...prev };
      
      // Handle CNOT control-target relationship
      if (gateType === 'CNOT' && cnotData) {
        // Set CONTROL qubit
        if (!newState[cnotData.controlQubit]) {
          newState[cnotData.controlQubit] = {};
        }
        newState[cnotData.controlQubit][cnotData.controlColumn] = {
          type: 'CNOT',
          isControl: true // Crucial for rendering
        };
  
        // Set TARGET qubit
        if (!newState[qubitIndex]) {
          newState[qubitIndex] = {};
        }
        newState[qubitIndex][columnIndex] = {
          type: 'CNOT',
          isTarget: true // Crucial for rendering
        };
      } 
      // Handle regular gates
      else {
        if (!newState[qubitIndex]) {
          newState[qubitIndex] = {};
        }
        newState[qubitIndex][columnIndex] = { type: gateType };
      }
  
      return newState;
    });
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--primary-background)' }}>
        <Header />

        <ControlBar 
          qubitCount={selectedQubitCount}
          setQubitCount={setSelectedQubitCount}
          onConfirm={handleConfirm}
          onClear = {handleClear}
          circuitState={circuitState}
        />

        <div className="p-6">
          <div className="flex gap-8">
            <div className="flex-1">
              <GatesSection 
                title="Basic Gates"
                gates={['H', 'X', 'Y', 'Z', 'CNOT', 'SWAP']}
              />
            </div>

            <div className="flex-1">
              <GatesSection
                title="Advanced Gates - To be added in the future"
                gates={['T', 'S', 'Rx', 'Ry', 'Rz']}
              />
            </div>

            <div className="w-64">
              <ResourceUsage />
            </div>
          </div>

          <CircuitGrid 
            qubitCount={confirmedQubitCount}
            circuitState={circuitState}
            onDropGate={handleDropGate}
          />
        </div>
        
      </div>
    </DndProvider>
  );
};

export default QuantumUI;