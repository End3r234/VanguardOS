// VanguardOS platform-level permissions
// CAD Moderators and above get global bypass on all servers

export const CAD_MODERATOR_EMAIL = 'ajk.simsdev@gmail.com'; // owner email — full bypass
export const GOD_MODE_EMAIL = 'jadenboudreau9@gmail.com'; // personal god mode — full bypass on everything
export const COMMUNITY_MANAGER_EMAILS = ['isnotgoodboeing@gmail.com'];

export const PLATFORM_BADGES = {
  owner: { label: 'Owner', color: '#FFD700', bg: '#FFD70015', border: '#FFD70050', description: 'VanguardOS Platform Owner' },
  community_manager: { label: 'Community Manager', color: '#A78BFA', bg: '#A78BFA15', border: '#A78BFA40', description: 'VanguardOS Community Manager' },
  early_supporter: { label: 'Early Supporter', color: '#F59E0B', bg: '#F59E0B15', border: '#F59E0B40', description: 'Supported VanguardOS before April 30, 2026' },
  veteran: { label: 'Veteran', color: '#8B5CF6', bg: '#8B5CF615', border: '#8B5CF640', description: 'Long-standing community member' },
  staff: { label: 'Staff', color: '#CE0000', bg: '#CE000015', border: '#CE000040', description: 'VanguardOS Staff Member' },
  cad_moderator: { label: 'CAD Moderator', color: '#3B82F6', bg: '#3B82F615', border: '#3B82F640', description: 'VanguardOS CAD Moderator' },
  developer: { label: 'Developer', color: '#10B981', bg: '#10B98115', border: '#10B98140', description: 'VanguardOS Developer' },
  beta_tester: { label: 'Beta Tester', color: '#EC4899', bg: '#EC489915', border: '#EC489940', description: 'Helped test VanguardOS' },
};

export function isGlobalModerator(profile) {
  if (!profile) return false;
  return ['developer', 'global_mod', 'admin', 'cad_moderator'].includes(profile.global_role) ||
    (profile.platform_badges || []).includes('cad_moderator') ||
    (profile.platform_badges || []).includes('staff');
}

export function hasPlatformBypass(profile, userEmail) {
  if (userEmail === GOD_MODE_EMAIL) return true;
  return isGlobalModerator(profile);
}

export function isGodMode(userEmail) {
  return userEmail === GOD_MODE_EMAIL;
}

export function canAccessGodPanel(profile, userEmail) {
  if (isGodMode(userEmail)) return true;
  if (COMMUNITY_MANAGER_EMAILS.includes(userEmail)) return true;
  if (!profile) return false;
  return profile.global_role === 'community_manager' ||
    (profile.platform_badges || []).includes('community_manager');
}