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
  
  // Adjust display for long bitstrings
  const getBitstringWidth = (str) => {
    const length = str.length;
    
    // Dynamically adjust width based on bitstring length
    if (length > 12) {
      return { minWidth: '130px', width: 'auto' };
    } else if (length > 8) {
      return { minWidth: '110px', width: 'auto' };
    }
    
    return {}; // Use default CSS width for shorter strings
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
        {sortedResults.map((result, index) => {
          const formattedString = formatBitstring(result.bitstring);
          
          return (
            <div key={index} className="outcome-row">
              <div 
                className="outcome-bitstring" 
                style={getBitstringWidth(formattedString)}
                title={`|${formattedString}⟩`} // Add tooltip for very long strings
              >
                |{formattedString}⟩
              </div>
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
          );
        })}
      </div>
    </div>
  );
};

export default MeasurementResults;