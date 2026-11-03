import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategories, fetchProducts } from "../api/client";
import { ProductCard } from "../components/ProductCard";
import { useI18n } from "../context/store";
import type { Category, Product } from "../types";

export function ShopPage() {
  const { t, name } = useI18n();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const category = params.get("category") ?? "";
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "newest";
  const minPrice = params.get("minPrice") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";

  useEffect(() => {
    fetchCategories().then(setCats).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts({
      q: q || undefined,
      category: category || undefined,
      sort: sort as "newest",
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      newArrival: params.get("newArrival") === "true" || undefined,
      bestSeller: params.get("bestSeller") === "true" || undefined,
      limit: 48,
    })
      .then((d) => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, q, sort, minPrice, maxPrice, params]);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[240px_1fr] gap-8">
      <aside className="space-y-6">
        <h1 className="font-serif text-3xl">{q ? t("searchResults") : t("shop")}</h1>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gold mb-2">{t("categories")}</p>
          <div className="flex flex-col gap-2 text-sm">
            <button className={!category ? "text-gold" : ""} onClick={() => set("category", "")}>
              {t("allCategories")}
            </button>
            {cats.map((c) => (
              <button key={c.id} className={category === c.slug ? "text-gold text-start" : "text-start"} onClick={() => set("category", c.slug)}>
                {name(c)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gold mb-2">{t("price")} (KWD)</p>
          <div className="flex gap-2">
            <input className="w-full border border-beige h-9 px-2" placeholder={t("minPrice")} defaultValue={minPrice} onBlur={(e) => set("minPrice", e.target.value)} />
            <input className="w-full border border-beige h-9 px-2" placeholder={t("maxPrice")} defaultValue={maxPrice} onBlur={(e) => set("maxPrice", e.target.value)} />
          </div>
        </div>
      </aside>
      <div>
        <div className="flex justify-end mb-4">
          <select value={sort} onChange={(e) => set("sort", e.target.value)} className="h-10 border border-beige bg-white px-3 text-sm">
            <option value="newest">{t("newest")}</option>
            <option value="price_asc">{t("priceLow")}</option>
            <option value="price_desc">{t("priceHigh")}</option>
            <option value="featured">{t("featured")}</option>
          </select>
        </div>
        {loading ? (
          <p>{t("loading")}</p>
        ) : products.length === 0 ? (
          <p>{t("noProducts")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
