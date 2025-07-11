import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy. You can return any unused items within 30 days of delivery.",
  },
  {
    question: "How do I track my order?",
    answer:
      "You can track your order using the tracking number sent to your email after the item is shipped.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. Shipping rates and delivery times vary based on location.",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can reach out to our support team through the Contact Us page or email us directly at support@example.com.",
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-md shadow-sm">
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-left text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => toggle(index)}
            >
              <span>{faq.question}</span>
              <span className="text-lg">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-600">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
