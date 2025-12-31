"use client";

import Stripe from "stripe";

type Props = {
  prices: Stripe.Price[];
};

export default function PricingInner({ prices }: Props) {
  if (!prices.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        No pricing plans available.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Pricing</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prices.map((price) => {
          const product = price.product as Stripe.Product;

          return (
            <div
              key={price.id}
              className="border rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold">
                {product.name}
              </h2>

              <p className="text-gray-600 mb-4">
                {product.description}
              </p>

              <p className="text-2xl font-bold mb-4">
                ${(price.unit_amount ?? 0) / 100}
                {price.recurring ? "/mo" : ""}
              </p>

              <form
                action="/api/create-checkout-session"
                method="POST"
              >
                <input
                  type="hidden"
                  name="priceId"
                  value={price.id}
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Buy
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
