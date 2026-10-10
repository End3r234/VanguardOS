import React from 'react';
import { Link } from 'react-router-dom';
import VanguardLogo from '@/components/VanguardLogo';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <header className="border-b border-white/[0.06] bg-[#111]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/"><VanguardLogo size="sm" /></Link>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-crimson text-xs uppercase tracking-widest font-semibold mb-2">Legal</p>
          <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: July 7, 2026 &nbsp;·&nbsp; Effective immediately</p>
        </div>

        <div className="space-y-8 text-white/75 leading-relaxed">

          <Section title="1. Information We Collect">
            We collect the following types of information:
            <ul>
              <li><strong>Account Information:</strong> Email address and display name provided during registration.</li>
              <li><strong>Profile Data:</strong> Optional information you choose to add such as bio, avatar, and badges.</li>
              <li><strong>Usage Data:</strong> Server memberships, roleplay characters, incident reports, and unit activity you create within the Platform.</li>
              <li><strong>Location & Position Data:</strong> When you update your unit position on the live dispatch map, your coordinates, nearest postal/street, and timestamp are logged in the Unit Position History. This data is visible to dispatchers and supervisors within your server.</li>
              <li><strong>Direct Messages:</strong> Messages you send or receive via the dispatcher-to-unit DM system are stored and visible to the sender and recipient within your server.</li>
              <li><strong>AI Context Data:</strong> When the AI Dispatch Assistant is enabled, it receives temporary context about your active calls and unit statuses to generate responses. This context is session-based and not permanently stored externally.</li>
              <li><strong>Technical Data:</strong> Browser type, IP address, and usage analytics collected automatically to improve the service.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul>
              <li>To provide and operate the VanguardOS Platform.</li>
              <li>To display your profile and activity to other users within your servers.</li>
              <li>To send service-related communications (account notices, security alerts).</li>
              <li>To improve platform features and fix issues.</li>
              <li>To enforce our Terms of Service and community guidelines.</li>
            </ul>
          </Section>

          <Section title="3. Data Visibility">
            <ul>
              <li><strong>Server members</strong> can see your callsign, unit status, and roleplay name when you are on duty within a shared server.</li>
              <li><strong>Dispatchers</strong> can see your unit details including callsign, department, vehicle, and on-duty time.</li>
              <li><strong>Dispatchers and supervisors</strong> can view your unit position on the live map and access your position history trail (timestamps, coordinates, and nearest postal/street).</li>
              <li><strong>Direct messages</strong> sent via the live map DM system are visible to the sender and recipient only.</li>
              <li><strong>Civilian data</strong> (characters, vehicles) is visible to law enforcement units within the same server via the database search.</li>
              <li><strong>Email notification subscriptions</strong> are private — your email is never shown to other users, and your optional department label is visible only to yourself.</li>
              <li><strong>Your email address</strong> is never publicly displayed to other users.</li>
            </ul>
          </Section>

          <Section title="4. Data Storage and Security">
            All data is stored securely using industry-standard encryption. We implement reasonable security measures to protect your information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.
          </Section>

          <Section title="5. Data Retention">
            We retain your data as long as your account is active. If you wish to delete your account or specific data, contact us through the Bug Reports page. Server data (calls, reports, members) is retained at the server owner's discretion.
          </Section>

          <Section title="6. Sharing of Information">
            We do not sell, rent, or trade your personal information to third parties. We may share data with:
            <ul>
              <li>Service providers necessary to operate the Platform (hosting, analytics).</li>
              <li>Law enforcement if required by law or to protect users' safety.</li>
            </ul>
          </Section>

          <Section title="7. Cookies and Tracking">
            VanguardOS uses cookies and local storage to maintain your session and remember preferences. We may use analytics tools to understand how users interact with the Platform. You can disable cookies in your browser, though this may affect functionality.
          </Section>

          <Section title="8. Children's Privacy">
            The Platform is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided personal data, we will delete it promptly.
          </Section>

          <Section title="9. Your Rights">
            Depending on your jurisdiction, you may have the right to:
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Object to processing of your data.</li>
            </ul>
            To exercise these rights, contact us via the Bug Reports page.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy periodically. We will notify users of material changes through the Platform. Continued use after changes are posted constitutes acceptance.
          </Section>

          <Section title="11. Contact">
            For privacy-related questions or requests, please use the Bug Reports page or contact us through the official VanguardOS community channels.
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