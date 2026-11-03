import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createOrder, fetchOrder, getWishlistProducts, GOVERNORATES, login, money, register } from "../api/client";
import { ProductCard } from "../components/ProductCard";
import { useAuth, useCart, useI18n } from "../context/store";
import type { Order } from "../types";

export function CartPage() {
  const { t, text, lang } = useI18n();
  const { items, updateQty, remove, subtotal } = useCart();
  const delivery = subtotal >= 50 ? 0 : 2;
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-4xl">{t("cart")}</h1>
        <p className="mt-4">{t("emptyCart")}</p>
        <Link to="/shop" className="inline-block mt-6 bg-ink text-white px-6 py-3 text-xs uppercase tracking-[0.16em]">
          {t("continueShopping")}
        </Link>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_320px] gap-8">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 bg-white border border-beige p-4">
            <img src={item.product.images[0]} alt="" className="h-28 w-24 object-cover" />
            <div className="flex-1">
              <p className="font-serif text-lg">{text(item.product.nameEn, item.product.nameAr)}</p>
              <p className="text-xs text-ink/60">
                {item.selectedSize} {item.selectedColour}
              </p>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQty(i, Number(e.target.value))}
                className="mt-2 h-9 w-20 border border-beige px-2"
              />
              <button className="ms-3 text-xs underline" onClick={() => remove(i)}>
                {t("remove")}
              </button>
            </div>
            <p className="text-gold">{money((item.product.discountPrice ?? item.product.price) * item.quantity, lang)}</p>
          </div>
        ))}
      </div>
      <aside className="bg-white border border-beige p-6 h-fit">
        <h2 className="font-serif text-2xl">{t("orderSummary")}</h2>
        <Row label={t("subtotal")} value={money(subtotal, lang)} />
        <Row label={t("deliveryFee")} value={delivery === 0 ? t("free") : money(delivery, lang)} />
        <Row label={t("total")} value={money(subtotal + delivery, lang)} />
        <p className="text-xs mt-3 text-ink/70">{t("cashOnDelivery")}</p>
        <Link to="/checkout" className="block text-center mt-5 h-12 leading-[48px] bg-ink text-white text-xs uppercase tracking-[0.18em]">
          {t("checkout")}
        </Link>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-beige text-sm">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function CheckoutPage() {
  const { t, lang, text } = useI18n();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const delivery = subtotal >= 50 ? 0 : 2;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const order = await createOrder({
        customerName: form.get("customerName"),
        customerPhone: String(form.get("customerPhone")).replace(/\s/g, ""),
        customerEmail: form.get("customerEmail"),
        governorate: form.get("governorate"),
        area: form.get("area"),
        block: form.get("block"),
        street: form.get("street"),
        buildingNumber: form.get("buildingNumber"),
        deliveryInstructions: form.get("deliveryInstructions"),
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColour: i.selectedColour,
        })),
      });
      clear();
      navigate(`/order/${order.orderNumber}`);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || t("error"));
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-16 text-center">
        <p>{t("emptyCart")}</p>
        <Link to="/shop" className="underline">{t("continueShopping")}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_340px] gap-8">
      <form onSubmit={submit} className="space-y-4 bg-white border border-beige p-6">
        <h1 className="font-serif text-3xl">{t("checkout")}</h1>
        <p className="text-sm text-gold">{t("cashOnDelivery")}</p>
        <Field name="customerName" label={t("fullName")} required />
        <Field name="customerPhone" label={t("phone")} required placeholder="9655XXXXXXX" />
        <Field name="customerEmail" label={t("emailOptional")} type="email" />
        <label className="block text-sm">
          {t("governorate")}
          <select name="governorate" required className="mt-1 w-full h-11 border border-beige px-3">
            {GOVERNORATES.map((g) => (
              <option key={g.en} value={g.en}>
                {lang === "ar" ? g.ar : g.en}
              </option>
            ))}
          </select>
        </label>
        <Field name="area" label={t("area")} required />
        <Field name="block" label={t("block")} required />
        <Field name="street" label={t("street")} required />
        <Field name="buildingNumber" label={t("building")} required />
        <label className="block text-sm">
          {t("instructions")}
          <textarea name="deliveryInstructions" className="mt-1 w-full border border-beige p-3 min-h-24" />
        </label>
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button disabled={busy} className="w-full h-12 bg-gold text-ink uppercase tracking-[0.18em] text-sm">
          {t("placeOrder")}
        </button>
      </form>
      <aside className="bg-white border border-beige p-6 h-fit">
        <h2 className="font-serif text-2xl mb-4">{t("orderSummary")}</h2>
        {items.map((i, idx) => (
          <p key={idx} className="text-sm py-2 border-b border-beige">
            {text(i.product.nameEn, i.product.nameAr)} × {i.quantity}
            <span className="block text-xs text-ink/60">
              {i.selectedSize} {i.selectedColour}
            </span>
          </p>
        ))}
        <Row label={t("subtotal")} value={money(subtotal, lang)} />
        <Row label={t("deliveryFee")} value={delivery === 0 ? t("free") : money(delivery, lang)} />
        <Row label={t("total")} value={money(subtotal + delivery, lang)} />
      </aside>
    </div>
  );
}

function Field({
  name,
  label,
  required,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} className="mt-1 w-full h-11 border border-beige px-3" />
    </label>
  );
}

export function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const { t, lang, text } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderNumber) fetchOrder(orderNumber).then(setOrder).catch(() => undefined);
  }, [orderNumber]);

  if (!order) return <p className="p-10">{t("loading")}</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-gold tracking-[0.3em] uppercase text-xs">{t("orderConfirmed")}</p>
      <h1 className="font-serif text-4xl mt-3">{t("thankYou")}</h1>
      <p className="mt-4 text-lg">
        {t("orderNumber")}: <strong>{order.orderNumber}</strong>
      </p>
      <div className="mt-8 text-start bg-white border border-beige p-6">
        {order.items.map((i) => (
          <p key={i.id} className="py-2 border-b border-beige text-sm">
            {text(i.productNameEn, i.productNameAr)} × {i.quantity} — {money(i.subtotal, lang)}
          </p>
        ))}
        <p className="mt-4 font-medium">
          {t("total")}: {money(order.total, lang)} · {t("cashOnDelivery")}
        </p>
      </div>
    </div>
  );
}

export function WishlistPage() {
  const { t } = useI18n();
  const products = getWishlistProducts();
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl mb-6">{t("wishlist")}</h1>
      {products.length === 0 ? (
        <p>{t("emptyWishlist")}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountPage() {
  const { t } = useI18n();
  const { user, setUser, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      if (mode === "login") {
        setUser(await login(String(form.get("email")), String(form.get("password"))));
      } else {
        setUser(
          await register({
            fullName: String(form.get("fullName")),
            email: String(form.get("email")),
            phone: String(form.get("phone") || ""),
            password: String(form.get("password")),
          }),
        );
      }
    } catch {
      setError(t("error"));
    }
  };

  if (user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <h1 className="font-serif text-4xl">{t("account")}</h1>
        <p className="mt-4">{user.fullName}</p>
        <p className="text-sm text-ink/70">{user.email}</p>
        {user.role === "ADMIN" && (
          <Link to="/admin" className="block mt-4 text-gold underline">
            {t("dashboard")}
          </Link>
        )}
        <button onClick={logout} className="mt-6 border border-ink px-5 py-2 text-xs uppercase tracking-[0.16em]">
          {t("login")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl mb-6">{mode === "login" ? t("login") : t("register")}</h1>
      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && <Field name="fullName" label={t("fullName")} required />}
        <Field name="email" label="Email" type="email" required />
        {mode === "register" && <Field name="phone" label={t("phone")} />}
        <Field name="password" label={t("password")} type="password" required />
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button className="w-full h-12 bg-ink text-white uppercase tracking-[0.16em] text-xs">
          {mode === "login" ? t("login") : t("register")}
        </button>
      </form>
      <button className="mt-4 text-sm underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? t("register") : t("login")}
      </button>
    </div>
  );
}

export function TrackPage() {
  const { t } = useI18n();
  const [n, setN] = useState("");
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl">{t("trackOrder")}</h1>
      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/order/${n}`);
        }}
      >
        <input value={n} onChange={(e) => setN(e.target.value)} className="flex-1 h-12 border border-beige px-3" placeholder="DD-..." />
        <button className="h-12 px-5 bg-ink text-white text-xs uppercase">{t("apply")}</button>
      </form>
    </div>
  );
}
