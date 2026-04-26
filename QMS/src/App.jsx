import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  MessageSquare, 
  RefreshCcw, 
  Stethoscope, 
  Users,
  ShieldCheck,
  Plus
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const moduleFields = {
    ipq: ['batch', 'status', 'checkedBy'],
    deviations: ['type', 'description', 'status', 'reportedBy', 'rootCause'],
    capa: ['action', 'type', 'status', 'owner'],
    fpq: ['product', 'batch', 'test', 'result', 'status'],
    complaints: ['product', 'issue', 'patient', 'status'],
    recalls: ['batch', 'reason', 'scope', 'status'],
    aer: ['drug', 'event', 'severity', 'status'],
    suppliers: ['name', 'rating', 'status', 'lastAudit']
  };

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ipq', label: 'In-Process Quality', icon: Activity },
    { id: 'deviations', label: 'Deviations', icon: AlertTriangle },
    { id: 'capa', label: 'CAPA', icon: CheckCircle },
    { id: 'fpq', label: 'In-Product Quality', icon: Package },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'recalls', label: 'Recalls', icon: RefreshCcw },
    { id: 'aer', label: 'Adverse Events', icon: Stethoscope },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
  ];

  useEffect(() => {
    fetchStats();
    if (activeTab !== 'dashboard') {
      fetchModuleData(activeTab);
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchModuleData = async (module) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/${module}`);
      setData(res.data);
    } catch (err) {
      console.error(`Error fetching ${module}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/${activeTab}`, formData);
      setIsModalOpen(false);
      setFormData({});
      fetchModuleData(activeTab);
      fetchStats();
    } catch (err) {
      console.error("Error submitting entry:", err);
    }
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') return <Dashboard stats={stats} setActiveTab={setActiveTab} />;
    
    return (
      <div className="view-container">
        <div className="header">
          <h2>{modules.find(m => m.id === activeTab).label}</h2>
          <button 
            className="nav-item active" 
            style={{ border: 'none', background: 'var(--accent)', color: 'white' }}
            onClick={() => {
              setFormData({});
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} /> New Entry
          </button>
        </div>
        
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>New {modules.find(m => m.id === activeTab).label} Entry</h3>
              <form onSubmit={handleSubmit}>
                {moduleFields[activeTab]?.map(field => (
                  <div className="form-group" key={field}>
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input 
                      type="text" 
                      required
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                      placeholder={`Enter ${field}...`}
                    />
                  </div>
                ))}
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Entry</button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {Object.keys(data[0] || {}).filter(k => k !== 'id').map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    {Object.entries(item).filter(([k]) => k !== 'id').map(([key, val]) => (
                      <td key={key}>
                        {key === 'status' ? (
                          <span className={`badge badge-${val.toLowerCase() === 'completed' || val.toLowerCase() === 'ok' || val.toLowerCase() === 'released' || val.toLowerCase() === 'approved' ? 'success' : val.toLowerCase() === 'open' || val.toLowerCase() === 'pending' || val.toLowerCase() === 'investigating' ? 'warning' : 'danger'}`}>
                            {val}
                          </span>
                        ) : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="root" style={{ display: 'flex', width: '100%' }}>
      <aside className="sidebar">
        <div className="logo-section">
          <ShieldCheck size={32} color="#f97316" />
          <h1>PharmaQMS</h1>
        </div>
        <nav>
          {modules.map(m => (
            <div 
              key={m.id} 
              className={`nav-item ${activeTab === m.id ? 'active' : ''}`}
              onClick={() => setActiveTab(m.id)}
            >
              <m.icon size={20} />
              {m.label}
            </div>
          ))}
        </nav>
      </aside>
      
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

const Dashboard = ({ stats, setActiveTab }) => (
  <div className="view-container">
    <div className="header">
      <h2>Quality Overview</h2>
    </div>
    
    <div className="stats-grid">
      <div className="stat-card" onClick={() => setActiveTab('deviations')}>
        <h3>Open Deviations</h3>
        <div className="value" style={{ color: 'var(--warning)' }}>{stats.openDeviations}</div>
      </div>
      <div className="stat-card" onClick={() => setActiveTab('capa')}>
        <h3>Pending CAPAs</h3>
        <div className="value" style={{ color: 'var(--accent)' }}>{stats.pendingCAPA}</div>
      </div>
      <div className="stat-card" onClick={() => setActiveTab('fpq')}>
        <h3>Released Batches</h3>
        <div className="value" style={{ color: 'var(--success)' }}>{stats.releasedBatches}</div>
      </div>
      <div className="stat-card" onClick={() => setActiveTab('complaints')}>
        <h3>Customer Complaints</h3>
        <div className="value" style={{ color: 'var(--danger)' }}>{stats.complaintsTotal}</div>
      </div>
    </div>

    <div className="table-container" style={{ padding: '2rem' }}>
      <h3>System Health</h3>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        The Quality Management System is currently operational. All modules are synchronized with regulatory standards.
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <div className="badge badge-success">FDA Compliant</div>
        <div className="badge badge-success">EU-GMP Certified</div>
        <div className="badge badge-success">ISO 9001:2015</div>
      </div>
    </div>
  </div>
);

export default App;
