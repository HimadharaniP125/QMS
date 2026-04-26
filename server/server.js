const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock Data
let qmsData = {
    ipq: [
        { id: 1, batch: 'BATCH-001', status: 'OK', checkedBy: 'QA-01', timestamp: new Date().toISOString() },
        { id: 2, batch: 'BATCH-002', status: 'Pending', checkedBy: 'QA-02', timestamp: new Date().toISOString() }
    ],
    deviations: [
        { id: 1, type: 'Critical', description: 'Temp exceeded 25C during mixing', status: 'Open', reportedBy: 'Prod-01', rootCause: 'Pending' }
    ],
    capa: [
        { id: 1, action: 'Repair Sensor #4', type: 'Corrective', status: 'Completed', owner: 'Maint-01' }
    ],
    fpq: [
        { id: 1, product: 'Paracetamol 500mg', batch: 'BATCH-001', test: 'Purity', result: '99.5%', status: 'Released' }
    ],
    complaints: [
        { id: 1, product: 'Aspirin', issue: 'Broken tablets', patient: 'Anonymous', status: 'Investigating' }
    ],
    recalls: [
        { id: 1, batch: 'BATCH-XYZ', reason: 'Impurity detected', scope: 'Regional', status: 'Active' }
    ],
    aer: [
        { id: 1, drug: 'Lisinopril', event: 'Rash reported', severity: 'Moderate', status: 'Reported' }
    ],
    suppliers: [
        { id: 1, name: 'ChemCorp', rating: 'A', status: 'Approved', lastAudit: '2024-01-15' }
    ],
    stats: {
        openDeviations: 1,
        pendingCAPA: 0,
        releasedBatches: 124,
        complaintsTotal: 5
    }
};

// Endpoints
app.get('/api/stats', (req, res) => res.json(qmsData.stats));

app.get('/api/:module', (req, res) => {
    const module = req.params.module;
    if (qmsData[module]) {
        res.json(qmsData[module]);
    } else {
        res.status(404).json({ error: 'Module not found' });
    }
});

app.post('/api/:module', (req, res) => {
    const module = req.params.module;
    if (qmsData[module]) {
        const newItem = { id: Date.now(), ...req.body, timestamp: new Date().toISOString() };
        qmsData[module].push(newItem);
        res.status(201).json(newItem);
    } else {
        res.status(404).json({ error: 'Module not found' });
    }
});

app.listen(PORT, () => {
    console.log(`QMS Backend running on http://localhost:${PORT}`);
});
