import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Fictionry',
  description: 'Fictionry terms of service - rules and guidelines for using our platform.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: February 2025</p>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using Fictionry, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            Fictionry is a platform that allows users to read, write, and share web fiction. 
            We provide tools for authors to publish their work and for readers to discover and 
            engage with stories.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To use certain features of Fictionry, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">4. User Content</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You retain ownership of content you create and publish on Fictionry. By posting 
            content, you grant us a non-exclusive, worldwide, royalty-free license to display, 
            distribute, and promote your content on our platform.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You are solely responsible for your content and must ensure it does not violate 
            these terms or any applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. Prohibited Content</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You may not post content that:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Infringes on intellectual property rights of others</li>
            <li>Contains illegal material or promotes illegal activities</li>
            <li>Harasses, threatens, or bullies other users</li>
            <li>Contains malware, spam, or deceptive content</li>
            <li>Exploits or harms minors in any way</li>
            <li>Violates any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">6. Community Guidelines</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To maintain a positive community, users must:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Treat others with respect in comments and interactions</li>
            <li>Provide constructive feedback, not harassment</li>
            <li>Not engage in rating manipulation or fake reviews</li>
            <li>Not create multiple accounts to circumvent restrictions</li>
            <li>Report violations rather than engaging in retaliation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Fictionry platform, including its design, features, and branding, is owned by 
            us and protected by intellectual property laws. You may not copy, modify, or distribute 
            our platform without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to suspend or terminate your account at any time for violations 
            of these terms or for any other reason at our discretion. You may also delete your 
            account at any time through your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground leading-relaxed">
            Fictionry is provided "as is" without warranties of any kind. We do not guarantee 
            that the service will be uninterrupted, secure, or error-free. We are not responsible 
            for user-generated content or interactions between users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">10. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, Fictionry shall not be liable for any 
            indirect, incidental, special, consequential, or punitive damages arising from your 
            use of the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">11. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these terms from time to time. Continued use of Fictionry after 
            changes constitutes acceptance of the new terms. We will make reasonable efforts to 
            notify users of significant changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">12. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@fictionry.io" className="text-violet-600 hover:text-violet-700">
              legal@fictionry.io
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
