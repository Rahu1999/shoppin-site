import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Return & Refund Policy — Rajesh Industries',
  description: 'Return and Refund Policy for Rajesh Industries (steelkitchen.in). Learn about our 7-day return window and refund process.',
};

export default function ReturnRefundPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">

        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Return and Refund Policy</h1>
          <p className="text-sm text-gray-500">Last updated: October 21, 2025</p>
        </div>

        <div className="prose prose-slate max-w-none text-gray-700 space-y-6 leading-relaxed">

          <p>Thank you for shopping at Rajesh Industries.</p>
          <p>
            If, for any reason, You are not completely satisfied with a purchase We invite You to review our policy on refunds and returns. The following terms are applicable for any products that You purchased with Us.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Interpretation and Definitions</h2>
          <h3 className="text-lg font-semibold text-gray-800">Interpretation</h3>
          <p>
            The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
          </p>
          <h3 className="text-lg font-semibold text-gray-800">Definitions</h3>
          <p>For the purposes of this Return and Refund Policy:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to Rajesh Industries.</li>
            <li><strong>Goods</strong> refer to the items offered for sale on the Service.</li>
            <li><strong>Orders</strong> mean a request by You to purchase Goods from Us.</li>
            <li><strong>Service</strong> refers to the Website.</li>
            <li>
              <strong>Website</strong> refers to Rajesh Industries, accessible from{' '}
              <a href="https://steelkitchen.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                https://steelkitchen.in/
              </a>
            </li>
            <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Your Order Cancellation Rights</h2>
          <p>
            You are entitled to cancel Your Order within 7 days without giving any reason for doing so.
          </p>
          <p>
            The deadline for cancelling an Order is 7 days from the date on which You received the Goods or on which a third party you have appointed, who is not the carrier, takes possession of the product delivered.
          </p>
          <p>In order to exercise Your right of cancellation, You must inform Us of your decision by means of a clear statement. You can inform us of your decision by:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              By email:{' '}
              <a href="mailto:rajeshindustries29@gmail.com" className="text-blue-600 hover:underline">
                rajeshindustries29@gmail.com
              </a>
            </li>
            <li>
              By visiting this page on our website:{' '}
              <Link href="/" className="text-blue-600 hover:underline">
                https://steelkitchen.in/
              </Link>
            </li>
            <li>
              By phone:{' '}
              <a href="tel:+919870212660" className="text-blue-600 hover:underline">
                +91 9870212660
              </a>
            </li>
          </ul>
          <p>
            We will reimburse You no later than 14 days from the day on which We receive the returned Goods. We will use the same means of payment as You used for the Order, and You will not incur any fees for such reimbursement.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Conditions for Returns</h2>
          <p>In order for the Goods to be eligible for a return, please make sure that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The Goods were purchased in the last 7 days</li>
            <li>The Goods are in the original packaging</li>
          </ul>
          <p>The following Goods cannot be returned:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The supply of Goods made to Your specifications or clearly personalized.</li>
            <li>The supply of Goods which according to their nature are not suitable to be returned, deteriorate rapidly or where the date of expiry is over.</li>
            <li>The supply of Goods which are not suitable for return due to health protection or hygiene reasons and were unsealed after delivery.</li>
            <li>The supply of Goods which are, after delivery, according to their nature, inseparably mixed with other items.</li>
          </ul>
          <p>
            We reserve the right to refuse returns of any merchandise that does not meet the above return conditions in our sole discretion.
          </p>
          <p>
            Only regular priced Goods may be refunded. Unfortunately, Goods on sale cannot be refunded. This exclusion may not apply to You if it is not permitted by applicable law.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Returning Goods</h2>
          <p>
            You are responsible for the cost and risk of returning the Goods to Us. You should send the Goods at the following address:
          </p>
          <address className="not-italic bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700">
            Sonawala Road<br />
            Goregaon East, Mumbai 400063
          </address>
          <p>
            We cannot be held responsible for Goods damaged or lost in return shipment. Therefore, We recommend an insured and trackable mail service. We are unable to issue a refund without actual receipt of the Goods or proof of received return delivery.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Gifts</h2>
          <p>
            If the Goods were marked as a gift when purchased and then shipped directly to you, You&apos;ll receive a gift credit for the value of your return. Once the returned product is received, a gift certificate will be mailed to You.
          </p>
          <p>
            If the Goods weren&apos;t marked as a gift when purchased, or the gift giver had the Order shipped to themselves to give it to You later, We will send the refund to the gift giver.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Shipping Policy</h2>
          <p>Thank you for shopping with us! We aim to deliver your order quickly and safely.</p>

          <h3 className="text-lg font-semibold text-gray-800">Order Processing Time</h3>
          <p>
            All orders are processed within <strong>1–2 business days</strong> (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification once your order has been shipped.
          </p>

          <h3 className="text-lg font-semibold text-gray-800">Estimated Delivery Time</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Within the same city:</strong> 2–4 business days</li>
            <li><strong>Within the same state:</strong> 3–6 business days</li>
            <li><strong>Across India:</strong> 5–10 business days</li>
          </ul>
          <p>
            Please note that delivery times may vary depending on your location, courier partner, and external factors such as weather or public holidays.
          </p>

          <h3 className="text-lg font-semibold text-gray-800">Shipping Charges</h3>
          <p>
            Shipping charges for your order will be calculated and displayed at checkout. We may offer <strong>free shipping</strong> on orders above a certain value as part of promotional offers.
          </p>

          <h3 className="text-lg font-semibold text-gray-800">Order Tracking</h3>
          <p>
            Once your order has shipped, you will receive a tracking number via email or SMS so you can follow your package&apos;s journey.
          </p>

          <h3 className="text-lg font-semibold text-gray-800">Delays or Issues</h3>
          <p>
            If your order is delayed beyond <strong>10 business days</strong>, please contact our support team at{' '}
            <a href="mailto:rajeshindustries29@gmail.com" className="text-blue-600 hover:underline">
              rajeshindustries29@gmail.com
            </a>. We will assist you promptly.
          </p>

          <h3 className="text-lg font-semibold text-gray-800">Damaged or Lost Packages</h3>
          <p>
            In the rare event your order arrives damaged or does not arrive within the expected timeframe, please reach out within <strong>48 hours</strong> of delivery (or the expected delivery date) so we can investigate and resolve the issue.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Contact Us</h2>
          <p>If you have any questions about our Returns and Refunds Policy, please contact us:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              By email:{' '}
              <a href="mailto:rajeshindustries29@gmail.com" className="text-blue-600 hover:underline">
                rajeshindustries29@gmail.com
              </a>
            </li>
            <li>
              By visiting this page on our website:{' '}
              <Link href="/return-refund-policy" className="text-blue-600 hover:underline">
                https://steelkitchen.in/return-refund-policy
              </Link>
            </li>
            <li>
              By phone:{' '}
              <a href="tel:+919870212660" className="text-blue-600 hover:underline">
                +91 9870212660
              </a>
            </li>
          </ul>

        </div>
      </div>
    </div>
  );
}
