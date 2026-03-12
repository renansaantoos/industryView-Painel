/**
 * Google Analytics gtag.js utility
 * Measurement ID: G-REG0CYB4JX
 */

const GA_MEASUREMENT_ID = 'G-REG0CYB4JX';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/** Send a custom event to Google Analytics */
export function gtagEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
}

/** Track a page view (for SPA route changes) */
export function gtagPageView(path: string, title?: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    });
  }
}

// ── Auth Events ──

export function gtagLogin(method = 'email') {
  gtagEvent('login', { method });
}

export function gtagSignup(method = 'email') {
  gtagEvent('sign_up', { method });
}

export function gtagLogout() {
  gtagEvent('logout');
}

// ── Navigation Events ──

export function gtagSelectCompany(companyId: number) {
  gtagEvent('select_company', { company_id: companyId });
}

// ── Project Events ──

export function gtagCreateProject(projectName: string) {
  gtagEvent('create_project', { project_name: projectName });
}

export function gtagViewProject(projectId: number | string) {
  gtagEvent('view_project', { project_id: projectId });
}

// ── Task Events ──

export function gtagCreateTask() {
  gtagEvent('create_task');
}

export function gtagCompleteTask() {
  gtagEvent('complete_task');
}

// ── Sprint Events ──

export function gtagCreateSprint() {
  gtagEvent('create_sprint');
}

// ── Report Events ──

export function gtagGenerateReport(reportType: string) {
  gtagEvent('generate_report', { report_type: reportType });
}

// ── AI Assistant Events ──

export function gtagUseAiAssistant() {
  gtagEvent('use_ai_assistant');
}

// ── Pricing / Conversion Events ──

export function gtagViewPricing() {
  gtagEvent('view_pricing');
}

export function gtagBeginCheckout(planName: string, value?: number) {
  gtagEvent('begin_checkout', {
    currency: 'BRL',
    value,
    items: [{ item_name: planName }],
  });
}
