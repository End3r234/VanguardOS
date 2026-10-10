import React from 'react';
import { Link } from 'react-router-dom';
import VanguardLogo from '@/components/VanguardLogo';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <header className="border-b border-white/[0.06] bg-[#111]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/"><VanguardLogo size="sm" /></Link>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-crimson text-xs uppercase tracking-widest font-semibold mb-2">Legal</p>
          <h1 className="text-4xl font-black mb-3">Terms of Service</h1>
          <p className="text-white/40 text-sm">Last updated: August 3, 2026 &nbsp;·&nbsp; Effective immediately</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/75 leading-relaxed">

          <Section title="1. Acceptance of Terms">
            By accessing or using VanguardOS ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform. These terms apply to all users, including server owners, members, and visitors.
          </Section>

          <Section title="2. Description of Service">
            VanguardOS is a web-based Computer-Aided Dispatch (CAD) and roleplay management platform designed for emergency services simulation communities. The Platform provides tools including live dispatch boards with auto-generated Incident IDs, unit management, civilian databases with Officer Safety Alert warnings, crash reconstruction tools, smart report building with type-adaptive forms, dynamic dispatch recommendations with confidence scoring, training systems, a live dispatch map with real-time unit tracking and position history, direct messaging between dispatchers and units, AI-powered dispatch and map extraction assistants, customizable CAD interface themes (modern, retro, tactical, EOC, cyber ops, and first responder), cinematic welcome experience, interactive onboarding tutorials and Learning Center, custom keyboard shortcuts, mobile companion mode, dispatcher focus mode, server template import/export, mini popup notifications, undo protection for destructive actions, operational replay system for after-action review, command mode for real-time operational overview, email notifications, and server administration.
          </Section>

          <Section title="3. User Accounts">
            <ul>
              <li>You must provide accurate information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 13 years of age to use the Platform.</li>
              <li>Account sharing is prohibited. Each account must represent a single individual.</li>
              <li>VanguardOS reserves the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </Section>

          <Section title="4. Server Ownership and Management">
            <ul>
              <li>Server owners are responsible for the content and conduct within their servers.</li>
              <li>Servers may not be used to facilitate harassment, discrimination, or illegal activities.</li>
              <li>VanguardOS reserves the right to remove servers that violate platform policies.</li>
              <li>Server owners must not impersonate real-world agencies or organizations in a misleading manner.</li>
            </ul>
          </Section>

          <Section title="5. Prohibited Conduct">
            You agree not to:
            <ul>
              <li>Use the Platform for any unlawful purpose or in violation of any regulations.</li>
              <li>Harass, abuse, or harm other users — including via the direct messaging system.</li>
              <li>Attempt to gain unauthorized access to other accounts or server systems.</li>
              <li>Upload malicious code, malware, or content designed to disrupt the Platform.</li>
              <li>Use automated bots, scrapers, or tools to extract data without permission.</li>
              <li>Impersonate VanguardOS staff, moderators, or other users.</li>
              <li>Exploit bugs or vulnerabilities — report them via the Bug Reports page instead.</li>
              <li>Abuse the AI assistant features to generate harmful, misleading, or inappropriate content.</li>
            </ul>
          </Section>

          <Section title="6. Intellectual Property">
            All Platform branding, logos, UI designs, and original content created by VanguardOS are the intellectual property of the Platform. User-created content (server names, characters, reports) remains owned by the respective users, but you grant VanguardOS a license to store and display it as necessary to operate the service.
          </Section>

          <Section title="7. Data and Privacy">
            Your use of the Platform is also governed by our <Link to="/privacy" className="text-crimson hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
          </Section>

          <Section title="8. Disclaimers">
            VanguardOS is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, and we are not liable for data loss, service interruptions, or damages arising from use of the Platform. VanguardOS is a simulation tool — it is not affiliated with any real-world law enforcement, fire, or emergency medical service agency.
          </Section>

          <Section title="9. Limitation of Liability">
            To the maximum extent permitted by law, VanguardOS shall not be liable for indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Platform.
          </Section>

          <Section title="10. Modifications to Terms">
            We reserve the right to update these Terms at any time. Continued use of the Platform after changes are posted constitutes acceptance of the updated terms. We will notify users of significant changes via the Blog or Announcements page.
          </Section>

          <Section title="11. Termination">
            VanguardOS may terminate or suspend your access at any time, with or without cause, at our sole discretion. Upon termination, your right to use the Platform ceases immediately.
          </Section>

          <Section title="12. Contact">
            For questions regarding these Terms, please use the Bug Reports page or reach out through the official VanguardOS community channels.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-white font-bold text-lg mb-3">{title}</h2>
      <div className="text-white/70 text-sm leading-relaxed space-y-2">
        {typeof children === 'string' ? <p>{children}</p> : children}
      </div>
    </div>
  );
}