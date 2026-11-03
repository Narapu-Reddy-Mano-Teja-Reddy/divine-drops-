import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { money } from "../api/client";
import { useCart, useI18n, useWishlist } from "../context/store";
import type { Product } from "../types";

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView?: (product: Product) => void;
}) {
  const { t, name, lang } = useI18n();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const price = product.discountPrice ?? product.price;
  const wished = has(product.id);

  return (
    <article className="group luxury-card relative overflow-hidden">
      <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] bg-beige overflow-hidden">
        <img
          src={product.images[0]}
          alt={name(product)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 start-3 flex flex-col gap-1">
          {product.isNewArrival && (
            <span className="bg-ink text-white text-[10px] tracking-[0.2em] uppercase px-2 py-1">{t("new")}</span>
          )}
          {product.isBestSeller && (
            <span className="bg-gold text-ink text-[10px] tracking-[0.2em] uppercase px-2 py-1">{t("bestseller")}</span>
          )}
          {product.discountPrice && (
            <span className="bg-white/90 text-ink text-[10px] tracking-[0.15em] uppercase px-2 py-1">
              -{Math.round((1 - product.discountPrice / product.price) * 100)}%
            </span>
          )}
        </div>
      </Link>
      <button
        type="button"
        aria-label={t("wishlist")}
        onClick={() => toggle(product)}
        className="absolute top-3 end-3 h-9 w-9 rounded-full bg-white/90 grid place-items-center"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : "text-ink"}`} />
      </button>
      <div className="p-4">
        <Link to={`/product/${product.id}`} className="font-serif text-lg leading-tight hover:text-gold">
          {name(product)}
        </Link>
        <div className="mt-2 flex items-center gap-2 text-sm">
          {product.discountPrice ? (
            <>
              <span className="text-gold font-medium">{money(price, lang)}</span>
              <span className="text-neutral-400 line-through text-xs">{money(product.price, lang)}</span>
            </>
          ) : (
            <span className="text-gold font-medium">{money(price, lang)}</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1 text-gold text-xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.round(product.rating) ? "fill-gold" : ""}`} />
          ))}
          <span className="text-neutral-500">({product.reviewCount})</span>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={product.stock < 1}
            onClick={() =>
              add({
                product,
                quantity: 1,
                selectedSize: product.sizes[0],
                selectedColour: product.colours[0],
              })
            }
            className="flex-1 h-10 bg-ink text-white text-xs tracking-[0.16em] uppercase flex items-center justify-center gap-2 hover:bg-gold hover:text-ink disabled:opacity-40"
          >
            <ShoppingBag className="h-4 w-4" />
            {product.stock < 1 ? t("outOfStock") : t("addToCart")}
          </button>
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="h-10 px-3 border border-beige text-[10px] tracking-[0.12em] uppercase"
            >
              {t("quickView")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
