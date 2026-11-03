import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchMe } from "../api/client";
import { translations, type TranslationKey } from "../i18n/translations";
import type { CartItem, Lang, Product, User } from "../types";

interface LanguageContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  name: (item: { nameEn: string; nameAr: string }) => string;
  text: (en: string, ar: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("dd_lang") as Lang) || "en");

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem("dd_lang", next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      t: (key) => translations[lang][key],
      name: (item) => (lang === "ar" ? item.nameAr : item.nameEn),
      text: (en, ar) => (lang === "ar" ? ar : en),
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: CartItem) => void;
  updateQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem("dd_cart") || "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem("dd_cart", JSON.stringify(items));
  }, [items]);

  const add = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.product.id === item.product.id &&
          p.selectedSize === item.selectedSize &&
          p.selectedColour === item.selectedColour,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });
  };

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => {
      const unit = i.product.discountPrice ?? i.product.price;
      return sum + unit * i.quantity;
    }, 0);
    return {
      items,
      add,
      updateQty: (index, qty) =>
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, quantity: Math.max(1, qty) } : it))),
      remove: (index) => setItems((prev) => prev.filter((_, i) => i !== index)),
      clear: () => setItems([]),
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

interface WishlistContextValue {
  ids: string[];
  toggle: (product: Product) => void;
  has: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dd_wish") || "[]") as string[];
    } catch {
      return [];
    }
  });
  const [map, setMap] = useState<Record<string, Product>>(() => {
    try {
      return JSON.parse(localStorage.getItem("dd_wish_map") || "{}") as Record<string, Product>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("dd_wish", JSON.stringify(ids));
    localStorage.setItem("dd_wish_map", JSON.stringify(map));
  }, [ids, map]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      has: (id) => ids.includes(id),
      toggle: (product) => {
        setIds((prev) => (prev.includes(product.id) ? prev.filter((x) => x !== product.id) : [...prev, product.id]));
        setMap((prev) => ({ ...prev, [product.id]: product }));
      },
    }),
    [ids],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

export function getWishlistProducts(): Product[] {
  try {
    const ids = JSON.parse(localStorage.getItem("dd_wish") || "[]") as string[];
    const map = JSON.parse(localStorage.getItem("dd_wish_map") || "{}") as Record<string, Product>;
    return ids.map((id) => map[id]).filter(Boolean);
  } catch {
    return [];
  }
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!localStorage.getItem("dd_token"));

  useEffect(() => {
    if (!localStorage.getItem("dd_token")) return;
    fetchMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("dd_token");
      })
      .finally(() => setReady(true));
  }, []);

  const logout = () => {
    localStorage.removeItem("dd_token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, ready, setUser, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
