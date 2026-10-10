import { base44 } from '@/api/base44Client';

export async function logIncidentEvent({ server_id, incident_id, call_id, event_type, description, actor_email, actor_name, metadata = {} }) {
  if (!incident_id || !server_id) return;
  try {
    return await base44.entities.IncidentEvent.create({
      server_id,
      incident_id,
      call_id: call_id || '',
      event_type,
      description: description || '',
      actor_email: actor_email || '',
      actor_name: actor_name || '',
      metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Failed to log incident event:', e);
  }
}