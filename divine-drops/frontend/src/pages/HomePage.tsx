import { motion } from "framer-motion";
import gsap from "gsap";
import { ArrowRight, ShieldCheck, Sparkles, Truck, Headphones } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { fetchBlogs, fetchProducts, fetchReviews } from "../api/client";
import { ProductCard } from "../components/ProductCard";
import { useI18n } from "../context/store";
import type { BlogPost, Product, Review } from "../types";

const HERO =
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1800&q=80";
const WOMEN =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80";
const BEAUTY =
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80";
const BAGS =
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80";
const COLLECTION =
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1800&q=80";

const circles = [
  { slug: "womens-clothing", img: WOMEN, en: "Fashion", ar: "أزياء" },
  { slug: "beauty", img: BEAUTY, en: "Beauty", ar: "جمال" },
  { slug: "accessories", img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80", en: "Shoes", ar: "أحذية" },
  { slug: "handbags", img: BAGS, en: "Handbags", ar: "حقائب يد" },
  { slug: "bags", img: "https://images.unsplash.com/photo-1590874103328-eac38a941954?auto=format&fit=crop&w=400&q=80", en: "Bags", ar: "حقائب" },
  { slug: "accessories", img: "https://images.unsplash.com/photo-1511499767150-a48a237ac008?auto=format&fit=crop&w=400&q=80", en: "Accessories", ar: "إكسسوارات" },
  { slug: "cosmetics", img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80", en: "Cosmetics", ar: "تجميل" },
  { slug: "accessories", img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80", en: "Gifts", ar: "هدايا" },
];

const insta = [WOMEN, BAGS, BEAUTY, COLLECTION, HERO, "https://images.unsplash.com/photo-1515562143877-75530c482c5e?auto=format&fit=crop&w=600&q=80"];

export function HomePage() {
  const { t, lang, text } = useI18n();
  const heroRef = useRef<HTMLDivElement>(null);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [best, setBest] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quick, setQuick] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts({ newArrival: true, limit: 6 }).then((d) => setNewArrivals(d.products)).catch(() => undefined);
    fetchProducts({ bestSeller: true, limit: 6 }).then((d) => setBest(d.products)).catch(() => undefined);
    fetchBlogs().then(setBlogs).catch(() => undefined);
    fetchReviews().then(setReviews).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-copy", { y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out" });
      gsap.from(".hero-img", { scale: 1.08, opacity: 0, duration: 1.4, ease: "power2.out" });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div>
      <section ref={heroRef} className="relative min-h-[78vh] overflow-hidden bg-beige">
        <img src={HERO} alt="" className="hero-img absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/90 via-cream/55 to-transparent rtl:bg-gradient-to-l" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 max-w-xl">
          <p className="hero-copy tracking-[0.35em] uppercase text-xs text-gold mb-4">{t("heroKicker")}</p>
          <h1 className="hero-copy font-serif text-5xl md:text-7xl leading-[0.95]">
            {t("heroTitle1")}
            <br />
            {t("heroTitle2")}
          </h1>
          <p className="hero-copy mt-4 tracking-[0.28em] uppercase text-xs">{t("heroSub")}</p>
          <p className="hero-copy mt-5 text-sm md:text-base text-ink/80 max-w-md">{t("heroCopy")}</p>
          <div className="hero-copy mt-8 flex gap-4">
            <Link to="/shop" className="px-7 py-3 bg-ink text-white text-xs tracking-[0.2em] uppercase">
              {t("shopNow")} →
            </Link>
            <Link to="/shop" className="px-7 py-3 border border-ink text-xs tracking-[0.2em] uppercase">
              {t("exploreCollections")}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-4 md:grid-cols-8 gap-4">
        {circles.map((c, i) => (
          <Link key={i} to={`/shop?category=${c.slug}`} className="text-center group">
            <div className="mx-auto h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-gold/50">
              <img src={c.img} alt="" className="h-full w-full object-cover group-hover:scale-110 transition" />
            </div>
            <p className="mt-2 text-[11px] tracking-[0.12em] uppercase">{lang === "ar" ? c.ar : c.en}</p>
          </Link>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-4">
        {[
          { img: WOMEN, title: t("womensCollection"), copy: t("womensCopy"), to: "/shop?category=womens-clothing" },
          { img: BEAUTY, title: t("beautyEssentials"), copy: t("beautyCopy"), to: "/shop?category=beauty" },
          { img: BAGS, title: t("bagsHandbags"), copy: t("bagsCopy"), to: "/shop?category=handbags" },
        ].map((b) => (
          <Link key={b.title} to={b.to} className="relative min-h-[280px] overflow-hidden group">
            <img src={b.img} alt="" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-ink/35" />
            <div className="relative p-8 text-white h-full flex flex-col justify-end">
              <h3 className="font-serif text-3xl">{b.title}</h3>
              <p className="text-sm text-white/80 mt-1">{b.copy}</p>
              <span className="mt-4 text-xs tracking-[0.2em] uppercase">{t("shopNow")} →</span>
            </div>
          </Link>
        ))}
      </section>

      <Section title={t("newArrivals")} sub={t("newArrivalsSub")} to="/shop?newArrival=true">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuick} />
          ))}
        </div>
      </Section>

      <Section title={t("shopByCategory")} sub={t("shopByCategorySub")} to="/shop">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { slug: "womens-clothing", img: WOMEN, k: t("womensClothing") },
            { slug: "mens-clothing", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", k: t("mensClothing") },
            { slug: "cosmetics", img: BEAUTY, k: t("cosmetics") },
            { slug: "handbags", img: BAGS, k: t("handbags") },
            { slug: "accessories", img: "https://images.unsplash.com/photo-1515562143877-75530c482c5e?auto=format&fit=crop&w=800&q=80", k: t("accessories") },
            { slug: "bags", img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80", k: t("gifts") },
          ].map((c) => (
            <Link key={c.slug} to={`/shop?category=${c.slug}`} className="relative h-56 overflow-hidden">
              <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-ink/30" />
              <p className="relative h-full grid place-items-end p-5 text-white font-serif text-2xl">{c.k}</p>
            </Link>
          ))}
        </div>
      </Section>

      <section className="relative my-10 min-h-[360px]">
        <img src={COLLECTION} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 text-white">
          <h2 className="font-serif text-5xl">{t("collectionTitle")}</h2>
          <p className="mt-3 max-w-md">{t("collectionCopy")}</p>
          <Link to="/shop" className="inline-block mt-6 border border-white px-6 py-3 text-xs tracking-[0.2em] uppercase">
            {t("exploreNow")}
          </Link>
        </div>
      </section>

      <Section title={t("bestseller")} to="/shop">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {best.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuick} />
          ))}
        </div>
      </Section>

      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-4 my-10">
        {[
          { t: t("seasonalOffers"), c: t("seasonalCopy"), to: "/shop" },
          { t: t("everydayEssentials"), c: t("everydayCopy"), to: "/shop" },
          { t: t("ramadanEdit"), c: t("ramadanCopy"), to: "/shop" },
        ].map((x) => (
          <Link key={x.t} to={x.to} className="bg-ink text-beige p-8">
            <h3 className="font-serif text-2xl text-gold">{x.t}</h3>
            <p className="text-sm mt-2 text-beige/80">{x.c}</p>
            <span className="inline-block mt-4 text-xs tracking-[0.2em] uppercase">{t("shopNow")} →</span>
          </Link>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-center">
        <img src={WOMEN} alt="" className="w-full h-[420px] object-cover" />
        <div>
          <p className="text-gold tracking-[0.3em] uppercase text-xs">{t("brand")}</p>
          <h2 className="font-serif text-4xl mt-2">{t("brandStoryTitle")}</h2>
          <p className="mt-4 text-ink/80 leading-relaxed">{t("brandStoryCopy")}</p>
          <Link to="/about" className="inline-flex items-center gap-2 mt-6 text-sm uppercase tracking-[0.16em]">
            {t("ourStory")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Section title={t("fromBlog")} sub={t("fromBlogSub")} to="/blog">
        <div className="grid md:grid-cols-3 gap-6">
          {blogs.slice(0, 3).map((b) => (
            <Link key={b.id} to={`/blog/${b.slug}`} className="luxury-card overflow-hidden">
              <img src={b.coverImage} alt="" className="h-52 w-full object-cover" />
              <div className="p-5">
                <h3 className="font-serif text-xl">{lang === "ar" ? b.titleAr : b.titleEn}</h3>
                <p className="text-sm text-ink/70 mt-2">{lang === "ar" ? b.excerptAr : b.excerptEn}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <section className="bg-beige/60 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-serif text-3xl mb-8">{t("reviews")}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <blockquote key={r.id} className="bg-white p-6 border border-beige">
                <p className="text-gold">{"★".repeat(r.rating)}</p>
                <p className="mt-3 text-sm leading-relaxed">{lang === "ar" ? r.commentAr : r.commentEn}</p>
                <footer className="mt-4 text-xs tracking-[0.16em] uppercase text-gold">{r.customerName}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Why icon={<Truck />} title={t("fastReliable")} />
          <Why icon={<ShieldCheck />} title={t("original")} />
          <Why icon={<Sparkles />} title={t("returns")} />
          <Why icon={<Headphones />} title={t("dedicatedSupport")} />
        </div>
        <h2 className="font-serif text-3xl mb-6">{t("instagram")}</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {insta.map((src) => (
            <img key={src} src={src} alt="" className="h-32 w-full object-cover" />
          ))}
        </div>
      </section>

      {quick && (
        <div className="fixed inset-0 z-50 bg-ink/50 grid place-items-center p-4" onClick={() => setQuick(null)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white max-w-2xl w-full grid md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={quick.images[0]} alt="" className="h-full object-cover min-h-[280px]" />
            <div className="p-6">
              <h3 className="font-serif text-2xl">{text(quick.nameEn, quick.nameAr)}</h3>
              <p className="text-gold mt-2">{text("KWD", "د.ك")} {(quick.discountPrice ?? quick.price).toFixed(3)}</p>
              <p className="text-sm mt-3 text-ink/70 line-clamp-4">{text(quick.descriptionEn, quick.descriptionAr)}</p>
              <Link to={`/product/${quick.id}`} className="inline-block mt-6 bg-ink text-white px-5 py-2 text-xs uppercase tracking-[0.16em]">
                {t("shopNow")}
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  sub,
  to,
  children,
}: {
  title: string;
  sub?: string;
  to: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-serif text-3xl">{title}</h2>
          {sub && <p className="text-sm text-ink/70 mt-1">{sub}</p>}
        </div>
        <Link to={to} className="text-xs tracking-[0.18em] uppercase text-gold">
          {t("viewAll")} →
        </Link>
      </div>
      {children}
    </section>
  );
}

function Why({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="text-gold">{icon}</div>
      <p className="text-sm">{title}</p>
    </div>
  );
}
