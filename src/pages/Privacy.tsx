import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <ScrollArea className="h-[600px] rounded-md border p-6">
          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-2">We collect the following information:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Account information (email, username, profile details)</li>
                <li>Payment information (processed securely via Stripe)</li>
                <li>Content you upload (audio files, metadata, descriptions)</li>
                <li>Usage data (browsing history, search queries, interactions)</li>
                <li>Device information (IP address, browser type, operating system)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provide and improve our services</li>
                <li>Process transactions and send notifications</li>
                <li>Personalize your experience and recommendations</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
              <p className="text-muted-foreground mb-2">We share your information with:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Service providers (Stripe for payments, Supabase for hosting)</li>
                <li>Other users (public profile information, uploaded content)</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your explicit consent</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                We never sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement industry-standard security measures including encryption, secure authentication, 
                and regular security audits. However, no method of transmission is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
              <p className="text-muted-foreground mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Cookies & Tracking</h2>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your experience, analyze usage, 
                and deliver personalized content. You can manage cookie preferences in your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your information for as long as your account is active or as needed to provide services. 
                After account deletion, we may retain certain data for legal compliance and fraud prevention.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Children's Privacy</h2>
              <p className="text-muted-foreground">
                HookDrop is not intended for users under 13. We do not knowingly collect information 
                from children. If we discover such data, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. International Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
              <p className="text-muted-foreground">
                For privacy concerns or to exercise your rights, contact us at privacy@hookdrop.com
              </p>
            </section>

            <p className="text-muted-foreground italic mt-8">
              Last updated: November 2, 2025
            </p>
          </div>
        </ScrollArea>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
