import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Map, Network, FileText, Cpu } from 'lucide-react';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar tactical-panel">
      <div className="sidebar-header">
        <Shield className="logo-icon" size={28} strokeWidth={1.5} />
        <div className="logo-text">
          <h2>KSP-INTEL</h2>
          <span><div className="status-led"></div> SYS-ONLINE</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/hotspots" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Map size={20} />
          <span>GIS Choropleth Map</span>
        </NavLink>
        <NavLink to="/network" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Network size={20} />
          <span>Link Analysis</span>
        </NavLink>
        <NavLink to="/cases" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>FIR ER Database</span>
        </NavLink>
        <NavLink to="/copilot" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Cpu size={20} />
          <span>AI Copilot (Offline)</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">A</div>
          <div className="user-info">
            <span className="name">Admin User</span>
            <span className="role">Central Command</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
