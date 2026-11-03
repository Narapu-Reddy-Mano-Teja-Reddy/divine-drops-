import { useEffect, useState, type FormEvent } from "react";
import {
  Facebook,
  Heart,
  Instagram,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  Youtube,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { fetchCategories, subscribeNewsletter } from "../api/client";
import { useAuth, useCart, useI18n } from "../context/store";
import type { Category } from "../types";

const announcements = {
  en: ["Kuwait Only", "Free Delivery Across Kuwait", "100% Original Products", "Easy Returns & Exchanges", "Customer Support"],
  ar: ["الكويت فقط", "توصيل مجاني في جميع أنحاء الكويت", "منتجات أصلية 100٪", "إرجاع واستبدال بسهولة", "خدمة العملاء"],
};

export function Layout() {
  const { t, lang, setLang, name } = useI18n();
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCats).catch(() => setCats([]));
  }, []);

  const search = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const nav = [
    { to: "/", label: t("home") },
    { to: "/shop", label: t("shop") },
    { to: "/shop?category=womens-clothing", label: t("fashion") },
    { to: "/shop?category=beauty", label: t("beauty") },
    { to: "/shop?category=handbags", label: t("bags") },
    { to: "/shop?category=accessories", label: t("accessories") },
    { to: "/shop?newArrival=true", label: t("newArrivals") },
    { to: "/shop?sort=featured", label: t("offers") },
    { to: "/blog", label: t("blog") },
  ];

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="bg-ink text-beige text-[11px] tracking-[0.18em] uppercase overflow-hidden">
        <div className="flex animate-[marquee_28s_linear_infinite] whitespace-nowrap py-2">
          {[...announcements[lang], ...announcements[lang]].map((item, i) => (
            <span key={i} className="px-8">
              {item} ·
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-beige">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu />
          </button>
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Divine Drops" className="h-14 w-14 object-contain" />
            <div className="hidden sm:block leading-tight">
              <p className="font-serif text-xl tracking-[0.18em] uppercase">Divine Drops</p>
              <p className="text-[10px] tracking-[0.28em] text-gold uppercase">{t("tagline")}</p>
            </div>
          </Link>
          <form onSubmit={search} className="hidden md:flex flex-1 max-w-xl mx-auto relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full h-11 rounded-full border border-beige bg-white ps-5 pe-12 text-sm outline-none focus:border-gold"
            />
            <button className="absolute end-3 top-1/2 -translate-y-1/2 text-gold" aria-label={t("shop")}>
              <Search className="h-4 w-4" />
            </button>
          </form>
          <div className="ms-auto flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="tracking-[0.2em] text-xs border border-gold px-2 py-1"
            >
              {lang === "en" ? "AR" : "EN"}
            </button>
            <Link to={user ? "/account" : "/account"} className="hidden sm:flex items-center gap-1 hover:text-gold">
              <UserRound className="h-4 w-4" /> {t("account")}
            </Link>
            <Link to="/wishlist" className="hover:text-gold" aria-label={t("wishlist")}>
              <Heart className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="relative hover:text-gold" aria-label={t("cart")}>
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-2 -end-2 h-5 min-w-5 px-1 rounded-full bg-gold text-[10px] grid place-items-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        <nav className="hidden lg:flex max-w-7xl mx-auto px-4 pb-3 items-center gap-6 text-[12px] tracking-[0.16em] uppercase">
          <Link to="/shop" className="bg-gold text-ink px-3 py-1.5">
            {t("allCategories")}
          </Link>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className="hover:text-gold">
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside
            className="absolute inset-y-0 start-0 w-80 bg-cream p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <img src="/logo.png" alt="" className="h-12" />
              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={search} className="mb-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full h-10 border border-beige px-3"
              />
            </form>
            <div className="flex flex-col gap-3 text-sm uppercase tracking-[0.14em]">
              {nav.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
              {cats.map((c) => (
                <Link key={c.id} to={`/shop?category=${c.slug}`} onClick={() => setOpen(false)}>
                  {name(c)}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      )}

      <main>
        <Outlet />
      </main>

      <footer className="bg-ink text-beige mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6 border-b border-white/10">
          <div>
            <h3 className="font-serif text-2xl text-gold">{t("newsletterTitle")}</h3>
            <p className="text-sm mt-2 text-beige/80">{t("newsletterCopy")}</p>
          </div>
          <form
            className="flex gap-2 items-center"
            onSubmit={async (e) => {
              e.preventDefault();
              await subscribeNewsletter(email);
              setDone(true);
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="flex-1 h-12 bg-transparent border border-gold/40 px-4 text-white"
            />
            <button className="h-12 px-6 bg-gold text-ink uppercase tracking-[0.16em] text-xs">
              {done ? t("subscribed") : t("subscribe")}
            </button>
          </form>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src="/logo.png" alt="Divine Drops" className="h-20 mb-4" />
            <p className="font-serif italic text-gold">{t("tagline")}</p>
            <div className="flex gap-3 mt-4">
              <Instagram className="h-4 w-4" />
              <Facebook className="h-4 w-4" />
              <Youtube className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h4 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">{t("shop")}</h4>
            <ul className="space-y-2 text-sm">
              {cats.map((c) => (
                <li key={c.id}>
                  <Link to={`/shop?category=${c.slug}`}>{name(c)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">{t("customerCare")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/track">{t("trackOrder")}</Link>
              </li>
              <li>
                <Link to="/delivery">{t("deliveryPolicy")}</Link>
              </li>
              <li>
                <Link to="/returns">{t("returnPolicy")}</Link>
              </li>
              <li>
                <Link to="/contact">{t("contact")}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">{t("footerAbout")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about">{t("ourStory")}</Link>
              </li>
              <li>
                <Link to="/privacy">{t("privacy")}</Link>
              </li>
              <li>
                <Link to="/terms">{t("terms")}</Link>
              </li>
              <li>
                <Link to="/admin/login">{t("admin")}</Link>
              </li>
            </ul>
            <p className="mt-6 text-xs tracking-[0.16em] uppercase text-gold">{t("proudly")}</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-beige/70">{t("rights")}</div>
      </footer>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        html[dir="rtl"] .animate-\\[marquee_28s_linear_infinite\\] { animation-direction: reverse; }
      `}</style>
    </div>
  );
}
