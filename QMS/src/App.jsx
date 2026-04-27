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
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

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
      if (editingId) {
        await axios.put(`${API_BASE}/${activeTab}/${editingId}`, formData);
      } else {
        await axios.post(`${API_BASE}/${activeTab}`, formData);
      }
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      fetchModuleData(activeTab);
      fetchStats();
    } catch (err) {
      console.error("Error submitting entry:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${API_BASE}/${activeTab}/${id}`);
        fetchModuleData(activeTab);
        fetchStats();
      } catch (err) {
        console.error("Error deleting entry:", err);
      }
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') return <Dashboard stats={stats} setActiveTab={setActiveTab} />;
    
    return (
      <div className="animate-fade-in">
        <div className="mb-10 flex justify-between items-center">
          <h2 className="text-3xl font-bold">{modules.find(m => m.id === activeTab).label}</h2>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setFormData({});
              setEditingId(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} /> New Entry
          </button>
        </div>
        
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[1000] animate-fade-in p-4">
            <div className="bg-[#141a23] border border-white/10 rounded-[24px] w-full max-w-[500px] p-10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">{editingId ? 'Edit' : 'New'} {modules.find(m => m.id === activeTab).label} Entry</h3>
              <form onSubmit={handleSubmit}>
                {moduleFields[activeTab]?.map(field => (
                  <div className="mb-5" key={field}>
                    <label className="block text-sm text-secondary-text mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-primary-text outline-none focus:border-accent transition-colors"
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                      placeholder={`Enter ${field}...`}
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-4 mt-10">
                  <button type="button" className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setEditingId(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Entry</button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center gap-3 text-secondary-text">
            <RefreshCcw className="animate-spin" size={20} />
            <p>Loading...</p>
          </div>
        ) : (
          <div className="bg-panel-bg border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    {Object.keys(data[0] || {}).filter(k => k !== 'id').map(key => (
                      <th key={key} className="px-6 py-4 text-secondary-text text-xs font-bold uppercase tracking-wider">{key}</th>
                    ))}
                    <th className="px-6 py-4 text-secondary-text text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                      {Object.entries(item).filter(([k]) => k !== 'id').map(([key, val]) => (
                        <td key={key} className="px-6 py-4 text-sm">
                          {key === 'status' ? (
                            <span className={`badge ${
                              val.toLowerCase() === 'completed' || val.toLowerCase() === 'ok' || val.toLowerCase() === 'released' || val.toLowerCase() === 'approved' 
                                ? 'bg-success/10 text-success' 
                                : val.toLowerCase() === 'open' || val.toLowerCase() === 'pending' || val.toLowerCase() === 'investigating' 
                                  ? 'bg-warning/10 text-warning' 
                                  : 'bg-danger/10 text-danger'
                            }`}>
                              {val}
                            </span>
                          ) : val}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg bg-white/5 text-secondary-text hover:bg-accent/10 hover:text-accent transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg bg-white/5 text-secondary-text hover:bg-danger/10 hover:text-danger transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="root" className="flex h-screen w-full bg-transparent">
      <aside className="w-[280px] bg-panel-bg backdrop-blur-xl border-r border-white/10 h-full flex flex-col p-6 z-10">
        <div className="flex items-center gap-3 mb-10">
          <ShieldCheck size={32} className="text-accent" />
          <h1 className="text-xl font-bold tracking-tight text-accent">PharmaQMS</h1>
        </div>
        <nav>
          {modules.map(m => (
            <div 
              key={m.id} 
              className={`flex items-center gap-3 p-3 px-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 font-medium ${
                activeTab === m.id 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-secondary-text hover:bg-white/5 hover:text-primary-text'
              }`}
              onClick={() => setActiveTab(m.id)}
            >
              <m.icon size={20} />
              {m.label}
            </div>
          ))}
        </nav>
      </aside>
      
      <main className="flex-1 p-10 overflow-y-auto bg-transparent">
        {renderContent()}
      </main>
    </div>
  );
};

const Dashboard = ({ stats, setActiveTab }) => (
  <div className="animate-fade-in">
    <div className="mb-10 flex justify-between items-center">
      <h2 className="text-3xl font-bold">Quality Overview</h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div className="stat-card" onClick={() => setActiveTab('deviations')}>
        <h3 className="text-secondary-text text-sm font-medium mb-2">Open Deviations</h3>
        <div className="text-3xl font-bold text-warning">{stats.openDeviations}</div>
      </div>
      <div className="stat-card" onClick={() => setActiveTab('capa')}>
        <h3 className="text-secondary-text text-sm font-medium mb-2">Pending CAPAs</h3>
        <div className="text-3xl font-bold text-accent">{stats.pendingCAPA}</div>
      </div>
      <div className="stat-card" onClick={() => setActiveTab('fpq')}>
        <h3 className="text-secondary-text text-sm font-medium mb-2">Released Batches</h3>
        <div className="text-3xl font-bold text-success">{stats.releasedBatches}</div>
      </div>
      <div className="stat-card" onClick={() => setActiveTab('complaints')}>
        <h3 className="text-secondary-text text-sm font-medium mb-2">Customer Complaints</h3>
        <div className="text-3xl font-bold text-danger">{stats.complaintsTotal}</div>
      </div>
    </div>

    <div className="bg-panel-bg border border-white/10 rounded-2xl overflow-hidden p-8">
      <h3 className="text-xl font-bold mb-2">System Health</h3>
      <p className="text-secondary-text mt-2 max-w-2xl">
        The Quality Management System is currently operational. All modules are synchronized with regulatory standards.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">FDA Compliant</span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">EU-GMP Certified</span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">ISO 9001:2015</span>
      </div>
    </div>
  </div>
);

export default App;
