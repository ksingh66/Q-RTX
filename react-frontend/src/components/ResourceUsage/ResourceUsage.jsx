import React from 'react';
import './ResourceUsage.css';

const ResourceUsage = () => {
  return (
    <div className="resource-usage">
      <h3 className="section-title">Resource Usage</h3>
      <div className="resource-panel">
        <div className="resource-item">
          <span>Memory Required:</span>
          <span className="resource-value">128 MB</span>
        </div>
        <div className="resource-item">
          <span>Est. Compute Time:</span>
          <span className="resource-value">&lt; 1s</span>
        </div>
      </div>
    </div>
  );
};

export default ResourceUsage;