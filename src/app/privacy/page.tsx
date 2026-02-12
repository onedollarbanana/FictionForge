import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - FictionForge',
  description: 'FictionForge privacy policy - how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: February 2025</p>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            FictionForge ("we", "our", or "us") respects your privacy and is committed to protecting 
            your personal data. This privacy policy explains how we collect, use, and safeguard your 
            information when you use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We collect information you provide directly to us:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Account Information:</strong> Email address, username, and password when you create an account</li>
            <li><strong>Profile Information:</strong> Display name, bio, and avatar image</li>
            <li><strong>Content:</strong> Stories, chapters, comments, and other content you create</li>
            <li><strong>Usage Data:</strong> Reading history, likes, follows, and interactions with the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Create and manage your account</li>
            <li>Enable features like reading progress, recommendations, and notifications</li>
            <li>Provide authors with analytics about their content</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Send technical notices and support messages</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">4. Information Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell your personal information. We may share information with third parties only 
            in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>With service providers who assist in operating our platform (e.g., hosting, analytics)</li>
            <li>To protect the rights, property, or safety of FictionForge, our users, or others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal 
            data against unauthorized access, alteration, disclosure, or destruction. However, no 
            method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Depending on your location, you may have rights regarding your personal data, including:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Access and receive a copy of your data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            To exercise these rights, please contact us at{' '}
            <a href="mailto:privacy@fictionforge.io" className="text-violet-600 hover:text-violet-700">
              privacy@fictionforge.io
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use essential cookies to maintain your session and preferences. We may also use 
            analytics cookies to understand how our platform is used. You can control cookies 
            through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">8. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            FictionForge is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If you believe we have collected 
            such information, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">9. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any changes 
            by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this privacy policy or our privacy practices, please 
            contact us at{' '}
            <a href="mailto:privacy@fictionforge.io" className="text-violet-600 hover:text-violet-700">
              privacy@fictionforge.io
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
