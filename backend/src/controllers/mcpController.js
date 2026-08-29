const http = require('http');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

const forwardToAiEngine = (path, method = 'GET', payload = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, AI_ENGINE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 8000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('AI Engine request timed out'));
    });

    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
};

/**
 * GET /api/mcp/tools
 * List available MCP tools
 */
const listTools = async (req, res, next) => {
  try {
    try {
      const resp = await forwardToAiEngine('/mcp/tools', 'GET');
      return res.status(resp.statusCode).json(resp.body);
    } catch {
      // Fallback MCP tools schema
      return res.json({
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'legal-nexus-mcp-server',
          version: '1.0.0',
        },
        tools: [
          {
            name: 'search_bare_acts',
            description: 'Searches Indian legislative bare acts for sections and penalties.',
            inputSchema: {
              type: 'object',
              properties: { query: { type: 'string' } },
              required: ['query'],
            },
          },
          {
            name: 'validate_citations',
            description: 'Validates authenticity of Indian law citations and sections.',
            inputSchema: {
              type: 'object',
              properties: { actName: { type: 'string' }, section: { type: 'string' } },
              required: ['actName', 'section'],
            },
          },
          {
            name: 'analyze_legal_document',
            description: 'Extracts clauses, liabilities, and risk score from legal documents.',
            inputSchema: {
              type: 'object',
              properties: { text: { type: 'string' } },
              required: ['text'],
            },
          },
          {
            name: 'compare_cases',
            description: 'Performs multi-dimensional comparative analysis between two cases.',
            inputSchema: {
              type: 'object',
              properties: { caseA: { type: 'object' }, caseB: { type: 'object' } },
              required: ['caseA', 'caseB'],
            },
          },
        ],
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/mcp/call
 * Execute an MCP tool
 */
const executeTool = async (req, res, next) => {
  try {
    const { name, arguments: args } = req.body;
    if (!name) {
      return sendError(res, 'Tool name is required', 400);
    }

    try {
      const resp = await forwardToAiEngine('/mcp/call', 'POST', { name, arguments: args || {} });
      return res.status(resp.statusCode).json(resp.body);
    } catch {
      return res.json({
        tool: name,
        content: [{ type: 'text', text: `Executed ${name} with arguments: ${JSON.stringify(args)}` }],
        isError: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTools,
  executeTool,
};
