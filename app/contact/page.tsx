'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/lib/providers/AuthProvider"; // Import UserData from AuthProvider
import { X } from "lucide-react"; // Import Lucide Cross icon

const Contact: React.FC = () => {
  const { user } = useAuth(); // user is now typed as UserData | null

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Effect to pre-fill form data if user is logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "", // Ensure name handles null correctly
        email: user.email || "", // Ensure email handles null correctly (though email should always be string)
      }));
      setShowModal(false); // Hide modal if user signs in while it's open
    } else {
      // Clear form data if user logs out
      setFormData((prev) => ({
        ...prev,
        name: "",
        email: "",
      }));
    }
  }, [user]);

  // Effect to clear status messages after a delay
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 5000); // Message visible for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Handle input changes for text area (name and email are disabled)
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation for message
    if (!formData.message.trim()) {
      setStatus({ type: 'error', message: 'Message cannot be empty.' });
      return;
    }

    if (!user) {
      setShowModal(true); // Show sign-in modal if user is not authenticated
      return;
    }

    setStatus({ type: null, message: '' }); // Clear previous status
    setLoading(true); // Set loading state

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // formData contains name, email, message
      });

      const data = await res.json(); // Parse response JSON

      if (res.ok && data.success) {
        setStatus({ type: 'success', message: data.message || 'Message sent successfully!' });
        setFormData((prev) => ({ ...prev, message: '' })); // Clear message field on success
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message. Please try again.' });
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error('Submit error:', errorMessage, error); // Log full error for debugging
      setStatus({ type: 'error', message: 'Something went wrong. Please try again later.' });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          We&apos;d love to hear from you. Fill out the form below and we&apos;ll get back to you soon.
        </p>

        {status.type && (
          <div
            className={`mb-6 px-4 py-3 rounded-md text-sm ${status.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
              }`}
            role={status.type === 'error' ? 'alert' : 'status'} // ARIA role for accessibility
          >
            {status.message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              disabled // Name is disabled as it's from authenticated user
              className="mt-1 block w-full px-4 py-2 border bg-gray-100 text-gray-700 border-gray-300 rounded-md shadow-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Your Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              disabled // Email is disabled as it's from authenticated user
              className="mt-1 block w-full px-4 py-2 border bg-gray-100 text-gray-700 border-gray-300 rounded-md shadow-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange} // This handles the textarea input
              required
              disabled={loading}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Write your message here..."
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition duration-150`}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm"> {/* Added bg-gray-900 and backdrop-blur-sm */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative text-center">
            {/* Lucide Cross Icon for close */}
            <button
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-semibold mb-4">Please Sign In</h2>
            <p className="mb-6 text-gray-700">You must be signed in to send a message.</p>
            <div className="flex justify-center space-x-4">
              <a
                href="/signin"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
