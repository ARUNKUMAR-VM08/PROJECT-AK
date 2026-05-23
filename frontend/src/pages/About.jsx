import React from 'react';
import SEO from '../components/SEO';
import { Heart, Sparkles, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 page-transition space-y-12">
      <SEO title="About Us" description="Learn about the origins of our Instagram gift boutique and how we handcraft each surprise package." />
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-pastel-navy">Our Story</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
          Crafting custom surprises, personalized LED cushions, and memory hampers designed to spread smiles and wrap emotions in beautiful packages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
        <div className="rounded-3xl overflow-hidden aspect-video md:aspect-[4/3] shadow-soft border border-brand-100">
          <img 
            src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop" 
            alt="Handcrafting gifts" 
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <h2 className="text-xl font-bold text-pastel-navy flex items-center gap-1.5">
            <Sparkles className="text-brand-500 animate-spin" size={18} />
            Handmade with Passion
          </h2>
          <p>
            What started as a tiny Instagram page with a passion for designing personalized photo frames for friends has blossomed into a full-fledged gift boutique.
          </p>
          <p>
            We believe that a gift shouldn't just be an object; it should be a key that unlocks beautiful memories. That is why every cushion, mug, and explosion box is handcrafted to meet your exact specifications.
          </p>
          <p>
            We package each gift with custom greeting cards, floral accents, and protective sleeves, ensuring it arrives in perfect condition to stun your loved ones.
          </p>
          <p className="font-bold text-pastel-navy">
            Thank you for supporting our local business! Your trust inspires us to keep crafting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
