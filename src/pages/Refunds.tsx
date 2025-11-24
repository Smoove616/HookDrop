import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const Refunds = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
        <ScrollArea className="h-[600px] rounded-md border p-6">
          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Digital Content Refunds</h2>
              <p className="text-muted-foreground">
                Due to the nature of digital content, all sales are generally final. However, 
                we offer refunds in specific circumstances outlined below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Eligible Refund Scenarios</h2>
              <p className="text-muted-foreground mb-2">Refunds may be granted if:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Content is significantly different from the description</li>
                <li>Audio files are corrupted or unplayable</li>
                <li>You were charged incorrectly or multiple times</li>
                <li>Content violates copyright or licensing terms</li>
                <li>Technical issues prevent download or access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Refund Request Timeline</h2>
              <p className="text-muted-foreground">
                Refund requests must be submitted within 14 days of purchase. Requests submitted 
                after this period will not be considered unless exceptional circumstances apply.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. How to Request a Refund</h2>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
                <li>Navigate to your purchase history in your profile</li>
                <li>Click "Request Refund" on the relevant purchase</li>
                <li>Provide detailed explanation and evidence if applicable</li>
                <li>Submit the dispute through our resolution system</li>
                <li>Wait for review (typically 3-5 business days)</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Refund Processing</h2>
              <p className="text-muted-foreground">
                Approved refunds are processed within 5-10 business days. Funds are returned 
                to the original payment method. Processing times may vary by payment provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Non-Refundable Items</h2>
              <p className="text-muted-foreground mb-2">The following are not eligible for refunds:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Subscription fees (unless cancelled within 48 hours of initial purchase)</li>
                <li>Content that has been used in commercial projects</li>
                <li>Purchases made more than 14 days ago</li>
                <li>Content downloaded and confirmed as working</li>
                <li>Change of mind after successful delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Subscription Cancellations</h2>
              <p className="text-muted-foreground">
                Subscriptions can be cancelled at any time. You will retain access until the end 
                of the current billing period. No partial refunds for unused subscription time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Dispute Resolution</h2>
              <p className="text-muted-foreground">
                If a refund request is denied, you may escalate the dispute through our 
                dispute resolution system. HookDrop's decision on disputed refunds is final.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Seller Protection</h2>
              <p className="text-muted-foreground">
                Sellers are protected against fraudulent refund claims. Evidence of content 
                delivery and quality is reviewed before approving refunds.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Contact Support</h2>
              <p className="text-muted-foreground">
                For refund inquiries or assistance, contact support@hookdrop.com or use 
                our in-platform dispute system.
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

export default Refunds;
