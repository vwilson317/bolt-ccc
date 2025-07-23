import { ExternalApiService } from '../src/services/externalApiService';

// This can be deployed as a Netlify function, Vercel function, or Firebase function
export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { barracaId, isOpen, manualStatus, specialAdminOverride, specialAdminOverrideExpires, apiKey } = req.body;

      const result = await ExternalApiService.updateBarracaStatus({
        barracaId,
        isOpen,
        manualStatus,
        specialAdminOverride,
        specialAdminOverrideExpires,
        apiKey
      });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  } else if (req.method === 'GET') {
    try {
      const { barracaId, apiKey } = req.query;

      const result = await ExternalApiService.getBarracaStatus(barracaId, apiKey);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
} 