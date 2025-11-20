export default function LegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-gray-800">
      <h1 className="text-4xl font-bold mb-8">Terms & Privacy</h1>

      {/* TERMS SECTION */}
      <section>
        <h2 className="text-3xl font-semibold mb-4">Terms of Service</h2>

        <p className="mb-4">
          By using remove-background.tech ("Service"), you agree to these Terms of Service.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Use of Service</h3>
        <p className="mb-4">
          You may use the Service in accordance with these Terms and applicable laws.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">2. Uploaded Images</h3>
        <p className="mb-4">
          You retain ownership of all images you upload. We temporarily process your images
          only to generate the output and then delete them.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">3. Credits & Billing</h3>
        <p className="mb-4">
          Credits purchased or earned allow usage of the AI background removal features.
          Credits are non-refundable except where required by law.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">4. Account Termination</h3>
        <p className="mb-4">
          We may suspend or terminate accounts that violate our terms or misuse the service.
        </p>
      </section>

      <hr className="my-12 border-gray-300" />

      {/* PRIVACY SECTION */}
      <section>
        <h2 className="text-3xl font-semibold mb-4">Privacy Policy</h2>

        <p className="mb-4">
          We value your privacy. This section explains what data we collect and how it is used.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h3>
        <p className="mb-4">
          We collect account information (email, login details), uploaded images,
          and basic usage analytics to improve the service.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">2. Image Processing</h3>
        <p className="mb-4">
          Images are used *only* for background removal and are deleted shortly after processing.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">3. Payments</h3>
        <p className="mb-4">
          Payments are handled securely through Stripe. We do not store card details.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">4. Your Rights</h3>
        <p className="mb-4">
          You may request deletion of your account or data at any time.
        </p>
      </section>

      <p className="mt-12 text-gray-600">
        Last updated: {new Date().getFullYear()}
      </p>
    </main>
  );
}
