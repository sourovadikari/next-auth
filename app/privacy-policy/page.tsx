import React from "react";
import Link from "next/link";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">
        Privacy Policy
      </h1>

      <p className="text-gray-700 mb-4">
        Last updated: July 4, 2025
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
        <p className="text-gray-700">
          We value your privacy and are committed to protecting your personal
          information. This Privacy Policy outlines how we collect, use, and
          safeguard your data when you use our website or services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
        <p className="text-gray-700 mb-2">
          We may collect the following types of information:
        </p>
        <ul className="list-disc list-inside text-gray-700">
          <li>Name and email address (if you sign up or contact us)</li>
          <li>Usage data and cookies</li>
          <li>Device and browser information</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
        <p className="text-gray-700">
          Your information is used to:
        </p>
        <ul className="list-disc list-inside text-gray-700">
          <li>Provide and maintain our services</li>
          <li>Respond to your inquiries</li>
          <li>Improve user experience and website performance</li>
          <li>Send updates or promotional emails (only if you opt in)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">4. Data Sharing</h2>
        <p className="text-gray-700">
          We do not sell or rent your personal information. We may share it with
          third-party providers to help us operate the website or comply with
          legal obligations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">5. Cookies</h2>
        <p className="text-gray-700">
          We use cookies to personalize content and analyze site traffic. You can
          choose to disable cookies in your browser settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">6. Your Rights</h2>
        <p className="text-gray-700">
          You have the right to access, correct, or delete your personal data. To
          make a request, <Link href="/contact" className="text-blue-600 hover:underline">contact us</Link>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">7. Changes to This Policy</h2>
        <p className="text-gray-700">
          We may update this Privacy Policy occasionally. We encourage you to
          review this page periodically for the latest information.
        </p>
      </section>

      <p className="text-gray-700 mt-10">
        If you have any questions, feel free to <Link href="/contact" className="text-blue-600 hover:underline">contact us</Link>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
