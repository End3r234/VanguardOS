import { base44 } from '@/api/base44Client';

const OPT_IN_KEY = 'vos-analytics-opt-in';

export function isAnalyticsEnabled() {
  try {
    return localStorage.getItem(OPT_IN_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAnalyticsEnabled(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(OPT_IN_KEY, '1');
    } else {
      localStorage.removeItem(OPT_IN_KEY);
    }
  } catch {}
}

export function trackEvent(eventName, properties = {}) {
  try {
    base44.analytics.track({ eventName, properties: { ...properties, _source: 'vanguardos' } });
    const { _category, ...rest } = properties;
    base44.entities.AnalyticsEvent.create({
      event_name: eventName,
      event_category: _category || 'feature_use',
      properties: rest,
    });
  } catch {}
}

export function trackPageView(path) {
  trackEvent('page_view', { path, _category: 'page_view' });
}

export const ANALYTICS_EVENTS = {
  MODULE_VIEW: 'module_view',
  CALL_CREATE: 'call_create',
  UNIT_ASSIGN: 'unit_assign',
  REPORT_SUBMIT: 'report_submit',
  AI_USE: 'ai_use',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  THEME_CHANGE: 'theme_change',
  SETTING_CHANGE: 'setting_change',
  SHORTCUT_USE: 'shortcut_use',
  REPLAY_VIEW: 'replay_view',
  COMMAND_MODE: 'command_mode',
  FOCUS_MODE: 'focus_mode',
  SERVER_IMPORT: 'server_import',
  CRASH_RECON: 'crash_reconstruction',
  SAFETY_ALERT: 'safety_alert',
  PAGE_VIEW: 'page_view',
};