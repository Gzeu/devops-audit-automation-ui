import { Router } from 'express';
import { AuditService } from '../services/auditService.js';
import { AuditRequest } from '../types/audit.js';

const router = Router();
const auditService = new AuditService();

// POST /api/audit/run
router.post('/run', async (req, res) => {
  try {
    const request: AuditRequest = req.body;
    
    // Validation
    if (!request.projectPath) {
      return res.status(400).json({ 
        error: 'projectPath is required' 
      });
    }
    
    if (!['quick', 'detailed', 'complete'].includes(request.auditType)) {
      return res.status(400).json({ 
        error: 'auditType must be quick, detailed, or complete' 
      });
    }
    
    console.log(`🚀 Starting ${request.auditType} audit for: ${request.projectPath}`);
    
    const result = await auditService.runAudit(request);
    
    console.log(`✅ ${request.auditType} audit completed with score: ${result.healthScore}/${result.maxScore}`);
    
    res.json(result);
  } catch (error: any) {
    console.error('❌ Audit failed:', error);
    res.status(500).json({ 
      error: error.message || 'Audit failed' 
    });
  }
});

// POST /api/audit/quick (backward compatibility)
router.post('/quick', async (req, res) => {
  try {
    const { projectPath } = req.body;
    const request: AuditRequest = {
      projectPath,
      auditType: 'quick'
    };
    
    const result = await auditService.runAudit(request);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/audit/analyze (backward compatibility)  
router.post('/analyze', async (req, res) => {
  try {
    const { projectPath } = req.body;
    const request: AuditRequest = {
      projectPath,
      auditType: 'detailed'
    };
    
    const result = await auditService.runAudit(request);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/audit/complete
router.post('/complete', async (req, res) => {
  try {
    const { projectPath } = req.body;
    const request: AuditRequest = {
      projectPath,
      auditType: 'complete'
    };
    
    const result = await auditService.runAudit(request);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audit/history
router.get('/history', async (req, res) => {
  try {
    res.json({ 
      audits: [],
      total: 0,
      message: 'Audit history will be implemented with database integration'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audit/stats
router.get('/stats', async (req, res) => {
  try {
    res.json({
      totalAudits: 0,
      avgHealthScore: 0,
      projectsTracked: 0,
      lastAudit: null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;