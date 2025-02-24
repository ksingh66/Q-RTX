import React, { useState } from 'react';
import { Plus, Minus, Check, Play, Save, Trash2 } from 'lucide-react';
import './ControlBar.css';
import MeasurementResults from './MeasurementResults';

const ControlBar = ({ qubitCount, setQubitCount, onConfirm, onClear, circuitState }) => {
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [confirmedQubitCount, setConfirmedQubitCount] = useState(qubitCount);
  
  const prepareCircuitData = (circuitState, numQubits) => {
    let operations = [];
    
    // Get all unique column indices
    const allColumns = new Set();
    Object.values(circuitState).forEach(qubitGates => {
      Object.keys(qubitGates).forEach(col => allColumns.add(parseInt(col)));
    });
    
    // Sort columns to ensure sequential ordering
    const sortedColumns = Array.from(allColumns).sort((a, b) => a - b);
    
    // For each column, get all gates that should be applied
    sortedColumns.forEach(columnIndex => {
      let columnOperations = [];
      
      // Check each qubit for gates in this column
      for (let qubitIndex = 0; qubitIndex < numQubits; qubitIndex++) {
        const gate = circuitState[qubitIndex]?.[columnIndex];
        if (gate) {
          const gateOperation = {
            qubit: qubitIndex,
            gate: gate.type
          };

          // Add CNOT control information if present
          if (gate.type === 'CNOT') {
            if (gate.isControl) {
              // Skip control points as they'll be included with target
              continue;
            }
            if (gate.isTarget) {
              // Find the control qubit
              for (let controlIndex = 0; controlIndex < numQubits; controlIndex++) {
                const controlGate = circuitState[controlIndex]?.[columnIndex];
                if (controlGate?.isControl) {
                  gateOperation.controlQubit = controlIndex;
                  gateOperation.controlColumn = columnIndex;
                  break;
                }
              }
            }
          }

          columnOperations.push(gateOperation);
        }
      }
      
      if (columnOperations.length > 0) {
        operations.push({
          column: columnIndex,
          gates: columnOperations
        });
      }
    });
    
    return {
      num_qubits: numQubits,
      operations: operations
    };
  };

  const handleIncrement = () => {
    setQubitCount(prevCount => prevCount < 25 ? prevCount + 1 : 25);
  };

  const handleDecrement = () => {
    setQubitCount(prevCount => prevCount > 1 ? prevCount - 1 : 1);
  };

  const handleConfirm = () => {
    setConfirmedQubitCount(qubitCount);
    // Clear all gates when confirming new qubit count
    if (onClear) {
      onClear();
    }
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    if (onClear) {
      onClear();
    }
    // Clear simulation results when circuit is cleared
    setSimulationResult(null);
  };

  const handleRun = async () => {
    try {
      setIsSimulating(true);
      // Prepare circuit data
      console.log('Current circuit state:', circuitState);
      const circuitData = prepareCircuitData(circuitState, confirmedQubitCount);
      console.log('Prepared circuit data:', circuitData);

      // Simulate the circuit
      const response = await fetch('http://localhost:8000/simulate-circuit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(circuitData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const simulationData = await response.json();
      console.log('Circuit simulation:', simulationData);
      setSimulationResult(simulationData);
      
    } catch (error) {
      console.error('Detailed error:', error);
      setSimulationResult({ 
        success: false,
        error_message: `Failed to simulate circuit: ${error.message}`
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="control-bar">
      <div className="control-bar-content">
        <div className="control-group-left">
          <div className="circuit-config">
            <h2 className="control-title">Circuit Setup</h2>
            <p className="control-subtitle">Configure your quantum circuit</p>
          </div>
          <div className="qubit-controls">
            <div className="qubit-counter-wrapper">
              <span className="qubit-label">Number of Qubits:</span>
              <div className="qubit-counter">
                <button 
                  className="counter-button"
                  onClick={handleDecrement}
                >
                  <Minus size={16} />
                </button>
                <span className="qubit-count">{qubitCount}</span>
                <button 
                  className="counter-button"
                  onClick={handleIncrement}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <button 
              className="action-button confirm-button"
              onClick={handleConfirm}
            >
              <Check size={18} />
              Confirm
            </button>
          </div>
        </div>
        <div className="control-group-right">
          <button 
            className={`action-button ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleRun}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <div className="spinner mr-2"></div>
                Simulating...
              </>
            ) : (
              <>
                <Play size={18} />
                Run
              </>
            )}
          </button>
          <button className="action-button">
            <Save size={18} />
            Save
          </button>
          <button 
            className="action-button"
            onClick={handleClear}
          >
            <Trash2 size={18} />
            Clear
          </button>
        </div>
      </div>
      
      {/* Display only measurement results */}
      {simulationResult && <MeasurementResults simulationResults={simulationResult} />}
      
      {/* Display errors */}
      {simulationResult?.error_message && (
        <div className="test-results p-4 mt-4 bg-red-50 rounded">
          <h3 className="font-bold mb-2 text-red-600">Error:</h3>
          <p className="text-red-500">{simulationResult.error_message}</p>
        </div>
      )}
    </div>
  );
};

export default ControlBar;