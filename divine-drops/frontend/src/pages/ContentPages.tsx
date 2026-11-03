import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBlog, fetchBlogs } from "../api/client";
import { useI18n } from "../context/store";
import type { BlogPost } from "../types";

export function BlogPage() {
  const { t, lang } = useI18n();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  useEffect(() => {
    fetchBlogs().then(setBlogs).catch(() => undefined);
  }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl mb-8">{t("fromBlog")}</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {blogs.map((b) => (
          <Link key={b.id} to={`/blog/${b.slug}`} className="luxury-card overflow-hidden">
            <img src={b.coverImage} alt="" className="h-52 w-full object-cover" />
            <div className="p-5">
              <h2 className="font-serif text-2xl">{lang === "ar" ? b.titleAr : b.titleEn}</h2>
              <p className="text-sm mt-2 text-ink/70">{lang === "ar" ? b.excerptAr : b.excerptEn}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogDetailPage() {
  const { slug } = useParams();
  const { lang } = useI18n();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  useEffect(() => {
    if (slug) fetchBlog(slug).then(setBlog).catch(() => undefined);
  }, [slug]);
  if (!blog) return <p className="p-10">…</p>;
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <img src={blog.coverImage} alt="" className="w-full h-80 object-cover" />
      <h1 className="font-serif text-4xl mt-6">{lang === "ar" ? blog.titleAr : blog.titleEn}</h1>
      <div className="mt-6 leading-8 text-ink/80 whitespace-pre-line">
        {lang === "ar" ? blog.contentAr : blog.contentEn}
      </div>
    </article>
  );
}

function Policy({ title, body }: { title: string; body: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl">{title}</h1>
      <p className="mt-6 leading-8 text-ink/80 whitespace-pre-line">{body}</p>
    </div>
  );
}

export function AboutPage() {
  const { t } = useI18n();
  return <Policy title={t("ourStory")} body={t("brandStoryCopy")} />;
}

export function DeliveryPage() {
  const { text } = useI18n();
  return (
    <Policy
      title={text("Delivery Policy", "سياسة التوصيل")}
      body={text(
        "Divine Drops delivers across Kuwait only. Standard delivery is KWD 2.000. Orders of KWD 50.000 and above qualify for free delivery. Delivery is cash on delivery. No online payment is collected.",
        "ديفين دروبس يوصل داخل الكويت فقط. رسوم التوصيل 2.000 د.ك. الطلبات بقيمة 50.000 د.ك فأكثر توصيلها مجاني. الدفع نقداً عند الاستلام. لا يتم تحصيل أي دفع إلكتروني.",
      )}
    />
  );
}

export function ReturnsPage() {
  const { text } = useI18n();
  return (
    <Policy
      title={text("Return Policy", "سياسة الإرجاع")}
      body={text(
        "Unused fashion items with original tags may be exchanged within 7 days of delivery. Beauty and cosmetics that have been opened cannot be returned. Contact customer care with your order number.",
        "يمكن استبدال قطع الأزياء غير المستخدمة مع البطاقات الأصلية خلال 7 أيام من التوصيل. منتجات الجمال المفتوحة غير قابلة للإرجاع. تواصل مع خدمة العملاء برقم طلبك.",
      )}
    />
  );
}

export function PrivacyPage() {
  const { text } = useI18n();
  return (
    <Policy
      title={text("Privacy Policy", "سياسة الخصوصية")}
      body={text(
        "We collect your name, Kuwait phone number and delivery address only to fulfil orders. We do not process online payments. Data is stored securely and used for order management.",
        "نجمع الاسم ورقم الهاتف الكويتي وعنوان التوصيل لتنفيذ الطلبات فقط. لا نعالج مدفوعات إلكترونية. تُحفظ البيانات بأمان لإدارة الطلبات.",
      )}
    />
  );
}

export function TermsPage() {
  const { text } = useI18n();
  return (
    <Policy
      title={text("Terms & Conditions", "الشروط والأحكام")}
      body={text(
        "Placing an order constitutes a request to purchase. Orders are confirmed by our team. Prices are in KWD. Divine Drops serves Kuwait only.",
        "تقديم الطلب يُعد طلباً للشراء. يتم تأكيد الطلبات من فريقنا. الأسعار بالدينار الكويتي. ديفين دروبس يخدم الكويت فقط.",
      )}
    />
  );
}

export function ContactPage() {
  const { t, text } = useI18n();
  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl">{t("contact")}</h1>
      <p className="mt-4">{text("WhatsApp / Phone: +965 5000 0000", "واتساب / هاتف: +965 5000 0000")}</p>
      <p>Email: george.a@example.org</p>
      <p className="mt-2">{text("Kuwait · Cash on delivery only", "الكويت · الدفع عند الاستلام فقط")}</p>
    </div>
  );
}
