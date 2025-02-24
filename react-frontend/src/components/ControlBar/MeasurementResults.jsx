import React from 'react';
import './MeasurementResults.css';

const MeasurementResults = ({ simulationResults }) => {
  if (!simulationResults || !simulationResults.success) {
    return null;
  }

  // Sort results by probability
  const sortedResults = [...simulationResults.top_results]
    .sort((a, b) => b.probability - a.probability);
    
  // Function to format bitstring properly
  const formatBitstring = (bitstring) => {
    if (!bitstring) return '';
    
    // Split the bitstring at the space
    const parts = bitstring.split(' ');
    
    // Take only the first part (before the space)
    // This removes the redundant zeros that Qiskit adds
    if (parts.length > 0) {
      return parts[0];
    }
    
    return bitstring;
  };

  return (
    <div className="measurement-results">
      <h3 className="measurement-title">Measurement Results</h3>
      
      <div className="measurement-stats">
        <div className="stat-item">
          <span className="stat-label">Total Shots</span>
          <span className="stat-value">{simulationResults.total_shots}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Execution Time</span>
          <span className="stat-value">{simulationResults.execution_time.toFixed(2)}s</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Unique Outcomes</span>
          <span className="stat-value">{Object.keys(simulationResults.measurement_counts).length}</span>
        </div>
      </div>
      
      <h4 className="outcomes-title">Top Measurement Outcomes</h4>
      
      <div className="outcome-list">
        {sortedResults.map((result, index) => (
          <div key={index} className="outcome-row">
            <div className="outcome-bitstring">|{formatBitstring(result.bitstring)}⟩</div>
            <div className="outcome-count">{result.count} shots</div>
            <div className="outcome-bar-container">
              <div 
                className="outcome-bar" 
                style={{ width: `${result.probability * 100}%` }}
              ></div>
            </div>
            <div className="outcome-percentage">
              {(result.probability * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeasurementResults;