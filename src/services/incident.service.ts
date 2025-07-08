import { promises as fs } from 'fs';
import path from 'path';
import type { Incident } from '@/lib/types';

export async function getIncidents(): Promise<Incident[]> {
  const filePath = path.join(process.cwd(), 'data/incidents.json');
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const incidents: Incident[] = JSON.parse(fileContents);
    return incidents;
  } catch (error) {
    console.error('Error reading or parsing incidents data:', error);
    return [];
  }
}
