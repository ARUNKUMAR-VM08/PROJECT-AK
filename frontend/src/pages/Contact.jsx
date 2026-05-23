import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Instagram } from '../components/BrandIcons';
import { toast } from 'react-toastify';
import { BRAND_CONFIG } from '../utils/constants';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message submitted successfully! We'll reply within 24 hours. 💌");
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 page-transition">
      <SEO title="Contact Us" description="Reach out to our customer support or order team directly on WhatsApp." />

      <h1 className="text-3xl font-extrabold text-pastel-navy text-center mb-10">Get in Touch</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Contact Info cards */}
        <div className="space-y-6">
          <div className="bg-white border border-brand-100 rounded-3xl p-6 shadow-soft space-y-4">
            <h3 className="font-bold text-pastel-navy text-base">Studio Info</h3>
            
            <ul className="space-y-4 text-xs text-gray-500 font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-brand-500 mt-0.5" />
                <span>{BRAND_CONFIG.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="text-brand-500" />
                <a href={`tel:${BRAND_CONFIG.phone}`} className="hover:text-brand-500">{BRAND_CONFIG.phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={18} className="text-brand-500" />
                <a href={`mailto:${BRAND_CONFIG.email}`} className="hover:text-brand-500">{BRAND_CONFIG.email}</a>
              </li>
            </ul>
          </div>

          <div className="bg-pastel-pink/30 border border-brand-100/40 rounded-3xl p-6 text-center space-y-4">
            <h3 className="font-extrabold text-pastel-navy text-sm">Direct Customer Support</h3>
            <p className="text-[11px] text-gray-500">
              Need updates on customizations? Click the link below to chat with our designer directly on WhatsApp.
            </p>
            <a
              href={`https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=Hi!%20I%20have%20an%20inquiry%20regarding%20custom%20gift%20orders.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-500 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-soft hover:bg-green-600 transition-colors"
            >
              <Send size={14} />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Message form */}
        <div className="bg-white border border-brand-100 rounded-3xl p-6 shadow-soft">
          <h3 className="font-bold text-pastel-navy text-base border-b border-brand-50 pb-3 mb-4">Send a Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Your Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Message Details</label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your inquiry..."
                rows={4}
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-premium text-xs transition-all focus:outline-none"
            >
              Submit Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
