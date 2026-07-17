import React from 'react';
import { Bell, Settings } from 'lucide-react';
import './Topbar.css';

interface TopbarProps {
  title: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
      </div>
      
      <div className="topbar-actions">
        <div className="action-btn">
          <Bell size={18} strokeWidth={1.5} />
          <span className="badge">3</span>
        </div>
        <div className="action-btn">
          <Settings size={18} strokeWidth={1.5} />
        </div>
      </div>
    </header>
  );
};
