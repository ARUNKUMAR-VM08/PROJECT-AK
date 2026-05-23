import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gift, Sparkles, Star, ChevronRight } from 'lucide-react';
import { Instagram } from '../components/BrandIcons';
import SEO          from '../components/SEO';
import ProductCard  from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { seedDatabase, SEED_PRODUCTS } from '../services/seed';
import { getFeaturedProducts, getBestSellers } from '../services/productService';
import { BRAND_CONFIG } from '../utils/constants';
import { useCategories } from '../context/CategoryContext';
import { toast } from 'react-toastify';

// ── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' } }),
};

const TESTIMONIALS = [
  { name: 'Priya S.', text: 'The LED cushion was absolutely stunning! Delivered in 3 days and perfectly customised.', rating: 5, location: 'Mumbai' },
  { name: 'Rahul M.', text: 'Ordered the chocolate hamper for my anniversary. She loved it! Will definitely order again.', rating: 5, location: 'Delhi' },
  { name: 'Ananya K.', text: 'The preserved rose dome is such a unique gift. Packaging was beautiful too!', rating: 5, location: 'Bangalore' },
];

const IG_POSTS = [
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80',
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80',
  'https://images.unsplash.com/photo-1582530391065-4ef3e7b5e78d?w=400&q=80',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&q=80',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
];

const Home = () => {
  const { categories } = useCategories();
  const [featured,     setFeatured]     = useState([]);
  const [bestSellers,  setBestSellers]  = useState([]);
  const [loadingF,     setLoadingF]     = useState(true);
  const [loadingB,     setLoadingB]     = useState(true);
  const [seeding,      setSeeding]      = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#categories') {
      const element = document.getElementById('categories');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location]);

  useEffect(() => {
    getFeaturedProducts().then((data) => {
      setFeatured(data.length ? data : SEED_PRODUCTS.filter(p => p.isFeatured).slice(0, 4).map((p, i) => ({ ...p, id: `demo-${i}` })));
      setLoadingF(false);
    });
    getBestSellers().then((data) => {
      setBestSellers(data.length ? data : SEED_PRODUCTS.filter(p => p.isBestSeller).slice(0, 4).map((p, i) => ({ ...p, id: `demo-bs-${i}` })));
      setLoadingB(false);
    });
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    const result = await seedDatabase();
    setSeeding(false);
    if (result.success) {
      toast.success(`✅ Seeded ${result.count} products to Firestore!`);
      window.location.reload();
    } else {
      toast.error('Seeding failed. Check Firebase credentials in your .env file.');
    }
  };

  return (
    <>
      <SEO title="Home" description={`${BRAND_CONFIG.name} — ${BRAND_CONFIG.tagline}. Shop personalised gifts for every occasion.`} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pastel-cream via-pastel-pink to-pastel-peach min-h-[88vh] flex items-center" aria-label="Hero section">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full filter blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pastel-clay rounded-full filter blur-3xl opacity-30 translate-y-1/3 -translate-x-1/4" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left copy */}
          <div className="space-y-7">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <span className="inline-flex items-center gap-2 bg-brand-100 text-brand-600 font-bold text-xs px-4 py-1.5 rounded-full">
                <Sparkles size={13} aria-hidden="true" /> Handcrafted with Love
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-pastel-navy leading-tight"
            >
              Gifts That Make<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                Memories Last
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-base text-gray-500 leading-relaxed max-w-lg"
            >
              Premium personalised gifts for every occasion — birthdays, anniversaries, festivals, and beyond. Fast delivery across India.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="flex flex-wrap gap-3"
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-7 py-3.5 rounded-full text-sm shadow-premium transition-all hover:scale-105 active:scale-95"
              >
                <Gift size={16} aria-hidden="true" /> Shop Now
              </Link>
              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-pastel-navy font-bold px-7 py-3.5 rounded-full text-sm shadow-soft border border-brand-100 hover:bg-pastel-pink/50 transition-all"
              >
                <Instagram size={16} aria-hidden="true" /> Follow Us
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="flex flex-wrap gap-8 pt-2"
            >
              {[['500+', 'Happy Customers'], ['100+', 'Gift Options'], ['3–5 Days', 'Delivery']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black text-brand-500">{val}</p>
                  <p className="text-xs text-gray-400 font-semibold">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right image collage */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="hidden lg:grid grid-cols-2 gap-4"
            aria-hidden="true"
          >
            {IG_POSTS.slice(0, 4).map((src, i) => (
              <div key={i} className={`rounded-3xl overflow-hidden shadow-soft ${i === 1 ? 'mt-8' : ''} ${i === 2 ? '-mt-4' : ''}`}>
                <img src={src} alt="" loading="lazy" className="w-full h-44 object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section id="categories" className="py-16 bg-white" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <motion.h2 id="categories-heading" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-3xl font-black text-pastel-navy">
              Shop by Occasion
            </motion.h2>
            <p className="text-sm text-gray-400 mt-2">Find the perfect gift for every moment</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.slug} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <Link
                  to={`/categories/${cat.slug}`}
                  className={`group flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${cat.color} hover:shadow-soft transition-all hover:-translate-y-1`}
                  aria-label={`Browse ${cat.label}`}
                >
                  <span className="text-3xl" aria-hidden="true">{cat.emoji}</span>
                  <span className="text-xs font-bold text-pastel-navy text-center leading-tight">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────────── */}
      <section className="py-16 bg-pastel-cream" aria-labelledby="featured-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <motion.h2 id="featured-heading" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-3xl font-black text-pastel-navy">Featured Gifts</motion.h2>
              <p className="text-sm text-gray-400 mt-1">Hand-picked just for you</p>
            </div>
            <Link to="/shop" className="flex items-center gap-1 text-brand-500 font-bold text-sm hover:gap-2 transition-all">
              View All <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {loadingF ? <ProductGridSkeleton count={4} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── BEST SELLERS ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-white" aria-labelledby="bestsellers-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <motion.h2 id="bestsellers-heading" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-3xl font-black text-pastel-navy">Best Sellers</motion.h2>
              <p className="text-sm text-gray-400 mt-1">Most loved by our customers</p>
            </div>
            <Link to="/shop?sort=rating" className="flex items-center gap-1 text-brand-500 font-bold text-sm hover:gap-2 transition-all">
              See All <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {loadingB ? <ProductGridSkeleton count={4} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-pastel-pink to-pastel-peach" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <motion.h2 id="testimonials-heading" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-3xl font-black text-pastel-navy">Happy Customers</motion.h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.blockquote
                key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="bg-white rounded-3xl p-6 shadow-soft"
              >
                <div className="flex gap-0.5 mb-3" aria-label={`Rated ${t.rating} stars`}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={13} className="text-pastel-gold fill-pastel-gold" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">"{t.text}"</p>
                <footer className="mt-4">
                  <p className="text-xs font-bold text-pastel-navy">{t.name}</p>
                  <p className="text-[10px] text-gray-400">{t.location}</p>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM SECTION ─────────────────────────────────────────────── */}
      <section className="py-16 bg-white" aria-labelledby="instagram-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <motion.h2 id="instagram-heading" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-3xl font-black text-pastel-navy">
              Follow Our Journey
            </motion.h2>
            <p className="text-sm text-gray-400 mt-2">{BRAND_CONFIG.instagramHandle} — Tag us for a feature!</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8">
            {IG_POSTS.map((src, i) => (
              <motion.a
                key={i}
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="aspect-square overflow-hidden rounded-2xl group"
                aria-label="View post on Instagram"
              >
                <img
                  src={src}
                  alt={`Instagram post ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.a>
            ))}
          </div>
          <div className="text-center">
            <a
              href={BRAND_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3 rounded-full text-sm shadow-soft hover:shadow-premium transition-all hover:scale-105"
            >
              <Instagram size={16} aria-hidden="true" /> Follow {BRAND_CONFIG.instagramHandle}
            </a>
          </div>
        </div>
      </section>

      {/* ── SEED BANNER (dev / demo only) ─────────────────────────────────── */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-30" role="complementary" aria-label="Developer tools">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="bg-pastel-navy text-white text-xs font-bold px-4 py-2 rounded-full shadow-premium flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            <Sparkles size={13} aria-hidden="true" />
            {seeding ? 'Seeding…' : 'Seed Firebase DB'}
          </button>
        </div>
      )}
    </>
  );
};

export default Home;
