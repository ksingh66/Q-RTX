import React from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import './Header.css'; // Added CSS import

const Header = () => {
  return (
    <header className="app-header">
      <h1 className="app-title">Q-RTX: A cuQuantum Simulation</h1>
      <div className="header-actions">
        <button className="action-button">
          <BookOpen size={18} />
          Tutorial
        </button>
        <button className="action-button">
          <HelpCircle size={18} />
          Help
        </button>
      </div>
    </header>
  );
};

export default Header;