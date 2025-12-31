import Stripe from "stripe";
import PricingInner from "./pricing-inner";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default async function PricingPage() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return (
      <div className="p-8 text-red-600">
        STRIPE_SECRET_KEY is not set
      </div>
    );
  }

  const prices = await stripe.prices.list({
    expand: ["data.product"],
    active: true,
  });

  return <PricingInner prices={prices.data} />;
}
