import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <ScrollArea className="h-[600px] rounded-md border p-6">
          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using HookDrop, you accept and agree to be bound by these Terms of Service. 
                If you do not agree, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. User Accounts</h2>
              <p className="text-muted-foreground mb-2">
                You must create an account to access certain features. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and current information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Content Ownership & Licensing</h2>
              <p className="text-muted-foreground mb-2">
                Sellers retain ownership of uploaded content. By uploading, you grant HookDrop:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Right to display, distribute, and promote your content</li>
                <li>License to process payments and deliver content to buyers</li>
                <li>Right to create previews and promotional materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Payments & Fees</h2>
              <p className="text-muted-foreground">
                HookDrop charges a platform fee on all transactions. Sellers receive payouts via Stripe Connect. 
                All prices are in USD unless otherwise specified. Refunds are handled per our Refund Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Prohibited Activities</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Uploading copyrighted content without permission</li>
                <li>Fraudulent transactions or chargebacks</li>
                <li>Harassment or abusive behavior</li>
                <li>Circumventing platform fees</li>
                <li>Automated scraping or data mining</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Dispute Resolution</h2>
              <p className="text-muted-foreground">
                Disputes between buyers and sellers are handled through our dispute resolution system. 
                HookDrop reserves the right to make final decisions on disputed transactions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate accounts that violate these terms. 
                Users may close their accounts at any time through account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                HookDrop is provided "as is" without warranties. We are not liable for indirect, 
                incidental, or consequential damages arising from platform use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may update these terms at any time. Continued use after changes constitutes acceptance. 
                Users will be notified of significant changes via email.
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

export default Terms;
