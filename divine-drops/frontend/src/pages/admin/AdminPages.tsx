import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import {
  api,
  fetchAdminDashboard,
  fetchAdminOrder,
  fetchAdminOrders,
  fetchCustomers,
  fetchInventory,
  login,
  money,
  patchOrderNotes,
  patchOrderStatus,
} from "../../api/client";
import { useAuth, useI18n } from "../../context/store";
import type { Order } from "../../types";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function AdminGuard() {
  const { user, ready } = useAuth();
  if (!ready) return <p className="p-10">Loading…</p>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return <Outlet />;
}

export function AdminLoginPage() {
  const { t } = useI18n();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const user = await login(String(form.get("email")), String(form.get("password")));
      setUser(user);
      if (user.role !== "ADMIN") {
        setError("Admin access required");
        return;
      }
      navigate("/admin");
    } catch {
      setError(t("error"));
    }
  };

  return (
    <div className="min-h-screen bg-ink text-beige grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-cream text-ink p-8">
        <img src="/logo.png" alt="" className="h-16 mx-auto" />
        <h1 className="font-serif text-3xl text-center mt-4">{t("admin")}</h1>
        <input name="email" type="email" required placeholder="Email" className="mt-6 w-full h-11 border border-beige px-3" defaultValue="george.a@example.org" />
        <input name="password" type="password" required placeholder="Password" className="mt-3 w-full h-11 border border-beige px-3" />
        {error && <p className="text-red-700 text-sm mt-2">{error}</p>}
        <button className="mt-5 w-full h-11 bg-ink text-white uppercase tracking-[0.16em] text-xs">{t("login")}</button>
      </form>
    </div>
  );
}

export function AdminShell() {
  const { t } = useI18n();
  const { logout } = useAuth();
  const links = [
    ["/admin", t("dashboard")],
    ["/admin/orders", t("orders")],
    ["/admin/inventory", t("inventory")],
    ["/admin/customers", t("customers")],
  ];
  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="no-print w-60 bg-ink text-beige p-6">
        <Link to="/" className="block mb-8">
          <img src="/logo.png" alt="Divine Drops" className="h-14" />
        </Link>
        <nav className="space-y-3 text-sm uppercase tracking-[0.14em]">
          {links.map(([to, label]) => (
            <Link key={to} to={to} className="block hover:text-gold">
              {label}
            </Link>
          ))}
          <button onClick={logout} className="mt-8 text-gold">
            {t("login")}
          </button>
        </nav>
      </aside>
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<{
    stats: Record<string, number>;
    lowStock: Array<{ id: string; nameEn: string; stock: number; sku: string }>;
    recentOrders: Order[];
  } | null>(null);

  useEffect(() => {
    fetchAdminDashboard().then(setData).catch(() => undefined);
  }, []);

  if (!data) return <p>{t("loading")}</p>;
  const s = data.stats;
  const cards = [
    [t("orders"), s.totalOrders],
    [t("pending"), s.pending],
    [t("confirmed"), s.confirmed],
    [t("processing"), s.processing],
    [t("shipped"), s.shipped],
    [t("delivered"), s.delivered],
    [t("cancelled"), s.cancelled],
    [t("sales"), money(s.totalSales, lang)],
  ];

  return (
    <div>
      <h1 className="font-serif text-4xl mb-8">{t("dashboard")}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="bg-white border border-beige p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-gold">{label}</p>
            <p className="font-serif text-3xl mt-2">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="font-serif text-2xl mt-10 mb-4">{t("lowStock")}</h2>
      <div className="bg-white border border-beige divide-y">
        {data.lowStock.map((p) => (
          <div key={p.id} className="px-4 py-3 flex justify-between text-sm">
            <span>
              {p.nameEn} · {p.sku}
            </span>
            <span className="text-gold">{p.stock}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminOrdersPage() {
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");

  const load = () => {
    fetchAdminOrders({ status, q }).then(setOrders).catch(() => setOrders([]));
  };

  useEffect(() => {
    load();
  }, [status]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <h1 className="font-serif text-4xl">{t("orders")}</h1>
        <button
          type="button"
          className="text-xs uppercase tracking-[0.16em] border border-gold px-3 py-2"
          onClick={async () => {
            const res = await api.get("/admin/orders/export/csv", { responseType: "blob" });
            const url = URL.createObjectURL(res.data as Blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "divine-drops-orders.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          {t("exportCsv")}
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder={`${t("orderNumber")} / ${t("fullName")}`} className="h-10 flex-1 border border-beige px-3" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 border border-beige px-3">
          <option value="ALL">ALL</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto bg-white border border-beige">
        <table className="w-full text-sm">
          <thead className="bg-beige/50 text-start">
            <tr>
              <th className="p-3 text-start">{t("orderNumber")}</th>
              <th className="p-3 text-start">{t("fullName")}</th>
              <th className="p-3">{t("status")}</th>
              <th className="p-3">{t("total")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-beige">
                <td className="p-3">
                  <Link className="text-gold" to={`/admin/orders/${o.id}`}>
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="p-3">
                  {o.customerName}
                  <div className="text-xs text-ink/60">{o.customerPhone}</div>
                </td>
                <td className="p-3">{o.orderStatus}</td>
                <td className="p-3">{money(o.total, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const { t, lang, text } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (id)
      fetchAdminOrder(id).then((o) => {
        setOrder(o);
        setNotes(o.adminNotes ?? "");
      });
  }, [id]);

  const phone = useMemo(() => {
    if (!order) return "";
    const digits = order.customerPhone.replace(/\D/g, "");
    return digits.startsWith("965") ? digits : `965${digits.replace(/^0/, "")}`;
  }, [order]);

  if (!order) return <p>{t("loading")}</p>;

  return (
    <div>
      <div className="no-print flex flex-wrap gap-3 mb-6">
        <h1 className="font-serif text-3xl flex-1">{order.orderNumber}</h1>
        <button onClick={() => window.print()} className="border px-3 py-2 text-xs uppercase">
          {t("printInvoice")}
        </button>
        <a
          className="border px-3 py-2 text-xs uppercase"
          href={`https://wa.me/${phone}?text=${encodeURIComponent(`Divine Drops ${order.orderNumber}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          {t("whatsapp")}
        </a>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-beige p-6">
          <p>
            {order.customerName} · {order.customerPhone}
          </p>
          <p className="text-sm mt-2">
            {order.governorate}, {order.area}, {t("block")} {order.block}, {order.street}, {order.buildingNumber}
          </p>
          {order.deliveryInstructions && <p className="text-sm mt-2">{order.deliveryInstructions}</p>}
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-gold">
            {order.paymentMethod} · {order.paymentStatus}
          </p>
        </div>
        <div className="bg-white border border-beige p-6 no-print">
          <label className="text-xs uppercase tracking-[0.16em]">{t("status")}</label>
          <select
            value={order.orderStatus}
            className="mt-2 w-full h-11 border border-beige"
            onChange={async (e) => setOrder(await patchOrderStatus(order.id, e.target.value))}
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <label className="block text-xs uppercase tracking-[0.16em] mt-4">{t("notes")}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 w-full border border-beige p-3 min-h-24" />
          <button
            className="mt-3 h-10 px-4 bg-ink text-white text-xs uppercase"
            onClick={async () => setOrder(await patchOrderNotes(order.id, notes))}
          >
            {t("save")}
          </button>
        </div>
      </div>
      <div className="mt-6 bg-white border border-beige">
        {order.items.map((i) => (
          <div key={i.id} className="p-4 border-b border-beige flex justify-between text-sm">
            <div>
              {text(i.productNameEn, i.productNameAr)} × {i.quantity}
              <div className="text-xs text-ink/60">
                {i.selectedSize} {i.selectedColour}
              </div>
            </div>
            <span>{money(i.subtotal, lang)}</span>
          </div>
        ))}
        <div className="p-4 font-medium">
          {t("total")}: {money(order.total, lang)}
        </div>
      </div>
    </div>
  );
}

export function AdminInventoryPage() {
  const { t, lang, text } = useI18n();
  const [rows, setRows] = useState<Array<{ id: string; nameEn: string; nameAr: string; sku: string; stock: number; price: string | number }>>([]);
  useEffect(() => {
    fetchInventory().then(setRows).catch(() => undefined);
  }, []);
  return (
    <div>
      <h1 className="font-serif text-4xl mb-6">{t("inventory")}</h1>
      <div className="bg-white border border-beige overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-beige/50">
              <th className="p-3 text-start">{t("products")}</th>
              <th className="p-3">SKU</th>
              <th className="p-3">{t("lowStock")}</th>
              <th className="p-3">{t("price")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-beige">
                <td className="p-3">{text(p.nameEn, p.nameAr)}</td>
                <td className="p-3">{p.sku}</td>
                <td className={`p-3 ${Number(p.stock) <= 5 ? "text-red-700" : ""}`}>{p.stock}</td>
                <td className="p-3">{money(Number(p.price), lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminCustomersPage() {
  const { t, lang } = useI18n();
  const [rows, setRows] = useState<
    Array<{
      customerPhone: string;
      customerName: string;
      customerEmail: string | null;
      governorate: string;
      area: string;
      _count: { _all: number };
      _sum: { total: number };
    }>
  >([]);
  useEffect(() => {
    fetchCustomers().then(setRows).catch(() => undefined);
  }, []);
  return (
    <div>
      <h1 className="font-serif text-4xl mb-6">{t("customers")}</h1>
      <div className="bg-white border border-beige divide-y">
        {rows.map((c) => (
          <div key={c.customerPhone + c.customerName} className="p-4 flex justify-between gap-4 text-sm">
            <div>
              <p>{c.customerName}</p>
              <p className="text-ink/60">
                {c.customerPhone} · {c.governorate} / {c.area}
              </p>
            </div>
            <div className="text-end">
              {c._count._all} {t("orders")}
              <div className="text-gold">{money(Number(c._sum.total ?? 0), lang)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
