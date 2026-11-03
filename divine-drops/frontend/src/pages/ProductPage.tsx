import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProduct, fetchProducts, money } from "../api/client";
import { ProductCard } from "../components/ProductCard";
import { useCart, useI18n, useWishlist } from "../context/store";
import type { Product } from "../types";

export function ProductPage() {
  const { id } = useParams();
  const { t, text, lang } = useI18n();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [size, setSize] = useState("");
  const [colour, setColour] = useState("");
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchProduct(id).then((p) => {
      setProduct(p);
      setSize(p.sizes[0] ?? "");
      setColour(p.colours[0] ?? "");
      fetchProducts({ category: p.category.slug, limit: 4 }).then((d) =>
        setRelated(d.products.filter((x) => x.id !== p.id)),
      );
    });
  }, [id]);

  if (!product) return <p className="p-10">{t("loading")}</p>;
  const price = product.discountPrice ?? product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <img src={product.images[img] ?? product.images[0]} alt="" className="w-full aspect-[4/5] object-cover bg-beige" />
          <div className="flex gap-2 mt-3">
            {product.images.map((src, i) => (
              <button key={src} onClick={() => setImg(i)} className={`h-20 w-20 overflow-hidden border ${i === img ? "border-gold" : "border-beige"}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gold">{text(product.category.nameEn, product.category.nameAr)}</p>
          <h1 className="font-serif text-4xl mt-2">{text(product.nameEn, product.nameAr)}</h1>
          <p className="text-gold text-xl mt-3">{money(price, lang)}</p>
          {product.discountPrice && <p className="text-sm line-through text-neutral-400">{money(product.price, lang)}</p>}
          <p className="mt-5 leading-relaxed text-ink/80">{text(product.descriptionEn, product.descriptionAr)}</p>
          <p className="mt-3 text-xs">{t("sku")}: {product.sku} · {product.stock > 0 ? t("inStock") : t("outOfStock")}</p>

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.16em] mb-2">{t("size")}</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`h-10 min-w-10 px-3 border ${size === s ? "bg-ink text-white" : "border-beige"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.colours.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.16em] mb-2">{t("colour")}</p>
              <div className="flex flex-wrap gap-2">
                {product.colours.map((c) => (
                  <button key={c} onClick={() => setColour(c)} className={`h-10 px-4 border ${colour === c ? "bg-ink text-white" : "border-beige"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex items-center gap-3">
            <label className="text-xs uppercase tracking-[0.16em]">{t("quantity")}</label>
            <input type="number" min={1} max={product.stock} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="h-10 w-20 border border-beige px-2" />
          </div>
          {error && <p className="text-red-700 text-sm mt-3">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button
              className="flex-1 h-12 bg-ink text-white uppercase tracking-[0.18em] text-xs"
              onClick={() => {
                if (product.sizes.length && !size) return setError(t("required"));
                add({ product, quantity: qty, selectedSize: size, selectedColour: colour });
                setError("");
              }}
            >
              {t("addToCart")}
            </button>
            <button className="h-12 w-12 border border-beige grid place-items-center" onClick={() => toggle(product)}>
              <Heart className={has(product.id) ? "fill-gold text-gold" : ""} />
            </button>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-serif text-3xl mb-6">{t("related")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
