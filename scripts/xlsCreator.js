import fs from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    const timestamp = new Date().toISOString();
    
    // Prepare CSV line
    const csvLine = [
      `"${data.fullName.replace(/"/g, '""')}"`,
      `"${data.email.replace(/"/g, '""')}"`,
      `"${data.whatsapp.replace(/"/g, '""')}"`,
      `"${data.location.replace(/"/g, '""')}"`,
      `"${data.properties.replace(/"/g, '""')}"`,
      `"${data.channelManager.replace(/"/g, '""')}"`,
      `"${(data.otherCM || '').replace(/"/g, '""')}"`,
      `"${data.features.join(', ').replace(/"/g, '""')}"`,
      `"${data.startDate.replace(/"/g, '""')}"`,
      `"${data.demoCall.replace(/"/g, '""')}"`,
      `"${(data.comments || '').replace(/"/g, '""')}"`,
      `"${timestamp}"`
    ].join(',') + '\n';

    // File path
    const filePath = join(process.cwd(), 'submissions.csv');
    
    // Check if file exists to determine if we need headers
    let needsHeader = false;
    try {
      await fs.promises.access(filePath);
    } catch {
      needsHeader = true;
    }

    // Add headers if needed
    if (needsHeader) {
      const headers = [
        'Full Name', 'Email', 'WhatsApp', 'Location', 'Properties',
        'Channel Manager', 'Other CM', 'Features', 'Start Date',
        'Demo Call', 'Comments', 'Submitted At'
      ].map(h => `"${h}"`).join(',') + '\n';
      
      await fs.promises.writeFile(filePath, headers);
    }

    // Append data
    await fs.promises.appendFile(filePath, csvLine);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing submission:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}