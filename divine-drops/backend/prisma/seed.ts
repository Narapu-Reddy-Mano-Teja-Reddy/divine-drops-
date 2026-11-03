import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = {
  blazer:
    "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=80",
  dress:
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
  abaya:
    "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=80",
  shirt:
    "https://images.unsplash.com/photo-1594938291221-94d14d6d5c6b?auto=format&fit=crop&w=900&q=80",
  trousers:
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
  handbag:
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
  tote: "https://images.unsplash.com/photo-1590874103328-eac38a941954?auto=format&fit=crop&w=900&q=80",
  clutch:
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80",
  backpack:
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
  lipstick:
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80",
  skincare:
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
  makeup:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
  sunglasses:
    "https://images.unsplash.com/photo-1511499767150-a48a237ac008?auto=format&fit=crop&w=900&q=80",
  heels:
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
  jewelry:
    "https://images.unsplash.com/photo-1515562143877-75530c482c5e?auto=format&fit=crop&w=900&q=80",
  scarf:
    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80",
  women:
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
  men: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
  gifts:
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80",
  blog1:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  blog2:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  blog3:
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
};

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "Admin@12345", 12);
  await prisma.user.create({
    data: {
      fullName: process.env.ADMIN_NAME ?? "Divine Drops Admin",
      email: (process.env.ADMIN_EMAIL ?? "george.a@example.org").toLowerCase(),
      phone: "+96550000000",
      passwordHash,
      role: "ADMIN",
    },
  });

  const categories = await Promise.all([
    prisma.category.create({
      data: { slug: "womens-clothing", nameEn: "Women's Clothing", nameAr: "ملابس نسائية", image: img.women },
    }),
    prisma.category.create({
      data: { slug: "mens-clothing", nameEn: "Men's Clothing", nameAr: "ملابس رجالية", image: img.men },
    }),
    prisma.category.create({
      data: { slug: "handbags", nameEn: "Handbags", nameAr: "حقائب يد", image: img.handbag },
    }),
    prisma.category.create({
      data: { slug: "bags", nameEn: "Bags", nameAr: "حقائب", image: img.backpack },
    }),
    prisma.category.create({
      data: { slug: "cosmetics", nameEn: "Cosmetics", nameAr: "مستحضرات تجميل", image: img.makeup },
    }),
    prisma.category.create({
      data: { slug: "beauty", nameEn: "Beauty Products", nameAr: "منتجات الجمال", image: img.skincare },
    }),
    prisma.category.create({
      data: { slug: "accessories", nameEn: "Accessories", nameAr: "إكسسوارات", image: img.jewelry },
    }),
  ]);

  const cat = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const products = [
    {
      nameEn: "Classic Tailored Blazer",
      nameAr: "بليزر كلاسيكي مفصل",
      descriptionEn: "Structured linen-blend blazer with a soft champagne lining. Designed for Kuwait evenings and office days.",
      descriptionAr: "بليزر من مزيج الكتان بقصة أنيقة وبطانة بلون الشمبانيا، مناسب لأيام العمل وسهرات الكويت.",
      price: 28.9,
      discountPrice: 24.5,
      categoryId: cat["womens-clothing"],
      images: [img.blazer, img.women],
      sizes: ["XS", "S", "M", "L", "XL"],
      colours: ["Ivory", "Black", "Camel"],
      stock: 18,
      sku: "DD-W-BLZ-001",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
    },
    {
      nameEn: "Silk Evening Dress",
      nameAr: "فستان سهرة حريري",
      descriptionEn: "Fluid silk midi dress with a refined neckline and effortless drape.",
      descriptionAr: "فستان ميدي من الحرير بقصة ناعمة وياقة راقية.",
      price: 42.0,
      discountPrice: null,
      categoryId: cat["womens-clothing"],
      images: [img.dress],
      sizes: ["S", "M", "L"],
      colours: ["Champagne", "Black", "Rose"],
      stock: 12,
      sku: "DD-W-DRS-002",
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      nameEn: "Linen Modest Set",
      nameAr: "طقم كتان محتشم",
      descriptionEn: "Breathable two-piece linen set tailored for warm Kuwait weather.",
      descriptionAr: "طقم كتان من قطعتين مصمم لأجواء الكويت الدافئة.",
      price: 19.75,
      discountPrice: 16.5,
      categoryId: cat["womens-clothing"],
      images: [img.abaya],
      sizes: ["S", "M", "L", "XL"],
      colours: ["Sand", "Olive", "White"],
      stock: 22,
      sku: "DD-W-SET-003",
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      nameEn: "Oxford Cotton Shirt",
      nameAr: "قميص قطن أكسفورد",
      descriptionEn: "Crisp men's oxford shirt with mother-of-pearl buttons.",
      descriptionAr: "قميص رجالي من القطن الأكسفورد بأزرار لؤلؤية.",
      price: 14.9,
      discountPrice: null,
      categoryId: cat["mens-clothing"],
      images: [img.shirt],
      sizes: ["S", "M", "L", "XL"],
      colours: ["White", "Sky", "Navy"],
      stock: 30,
      sku: "DD-M-SHT-004",
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      nameEn: "Tailored Wool Trousers",
      nameAr: "بنطلون صوف مفصل",
      descriptionEn: "Slim tailored trousers with a clean crease and comfort stretch.",
      descriptionAr: "بنطلون رجالي بقصة أنيقة ومرونة مريحة.",
      price: 18.5,
      discountPrice: 15.9,
      categoryId: cat["mens-clothing"],
      images: [img.trousers],
      sizes: ["30", "32", "34", "36"],
      colours: ["Charcoal", "Beige"],
      stock: 16,
      sku: "DD-M-TRS-005",
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      nameEn: "Quilted Chain Handbag",
      nameAr: "حقيبة يد مبطنة بسلسلة",
      descriptionEn: "Signature quilted handbag with a gold-tone chain and Divine Drops emblem.",
      descriptionAr: "حقيبة يد مبطنة بسلسلة ذهبية وشعار ديفين دروبس.",
      price: 36.5,
      discountPrice: 32.9,
      categoryId: cat.handbags,
      images: [img.handbag, img.clutch],
      sizes: ["One Size"],
      colours: ["Black", "Champagne", "Ivory"],
      stock: 14,
      sku: "DD-HB-QCH-006",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
    },
    {
      nameEn: "Structured Mini Bag",
      nameAr: "حقيبة صغيرة منظمة",
      descriptionEn: "Compact structured bag for evenings in Kuwait City.",
      descriptionAr: "حقيبة صغيرة أنيقة لسهرات مدينة الكويت.",
      price: 24.0,
      discountPrice: null,
      categoryId: cat.handbags,
      images: [img.clutch],
      sizes: ["One Size"],
      colours: ["Gold", "Black"],
      stock: 20,
      sku: "DD-HB-MIN-007",
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      nameEn: "Leather Tote",
      nameAr: "حقيبة توت جلد",
      descriptionEn: "Everyday leather tote with interior pockets for work and travel.",
      descriptionAr: "حقيبة توت جلدية يومية مع جيوب داخلية للعمل والسفر.",
      price: 29.9,
      discountPrice: 25.0,
      categoryId: cat.bags,
      images: [img.tote],
      sizes: ["One Size"],
      colours: ["Tan", "Black"],
      stock: 11,
      sku: "DD-BG-TOT-008",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      nameEn: "City Backpack",
      nameAr: "حقيبة ظهر للمدينة",
      descriptionEn: "Lightweight lifestyle backpack with laptop sleeve.",
      descriptionAr: "حقيبة ظهر خفيفة مع جيب للابتوب.",
      price: 17.5,
      discountPrice: null,
      categoryId: cat.bags,
      images: [img.backpack],
      sizes: ["One Size"],
      colours: ["Black", "Sand"],
      stock: 25,
      sku: "DD-BG-BPK-009",
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      nameEn: "Velvet Lip Colour",
      nameAr: "لون شفاه مخملي",
      descriptionEn: "Long-wear velvet lipstick in warm desert tones.",
      descriptionAr: "أحمر شفاه مخملي بثبات طويل بألوان الصحراء الدافئة.",
      price: 6.9,
      discountPrice: 5.5,
      categoryId: cat.cosmetics,
      images: [img.lipstick],
      sizes: [],
      colours: ["Rosewood", "Nude", "Berry"],
      stock: 40,
      sku: "DD-CO-LIP-010",
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
    },
    {
      nameEn: "Editorial Makeup Palette",
      nameAr: "باليت مكياج تحريري",
      descriptionEn: "Twelve wearable shades for day-to-night looks.",
      descriptionAr: "اثنتا عشرة درجة عملية لإطلالات النهار والليل.",
      price: 12.5,
      discountPrice: null,
      categoryId: cat.cosmetics,
      images: [img.makeup],
      sizes: [],
      colours: ["Warm Edit"],
      stock: 28,
      sku: "DD-CO-PLT-011",
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: false,
    },
    {
      nameEn: "Hydrating Skincare Set",
      nameAr: "طقم عناية مرطب",
      descriptionEn: "Cleanser, serum and cream formulated for dry indoor air.",
      descriptionAr: "غسول وسيروم وكريم للعناية بالبشرة في الأجواء الجافة.",
      price: 22.9,
      discountPrice: 18.9,
      categoryId: cat.beauty,
      images: [img.skincare],
      sizes: [],
      colours: [],
      stock: 19,
      sku: "DD-BE-SKN-012",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
    },
    {
      nameEn: "Designer Sunglasses",
      nameAr: "نظارات شمسية مصممة",
      descriptionEn: "Gold-accent frames with UV400 protection.",
      descriptionAr: "إطار بلمسات ذهبية وحماية UV400.",
      price: 15.9,
      discountPrice: 12.9,
      categoryId: cat.accessories,
      images: [img.sunglasses],
      sizes: ["One Size"],
      colours: ["Black", "Tortoise"],
      stock: 21,
      sku: "DD-AC-SUN-013",
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
    },
    {
      nameEn: "Elegant Heels",
      nameAr: "كعب أنيق",
      descriptionEn: "Pointed heels in champagne satin for dinners and events.",
      descriptionAr: "كعب مدبب من الساتان بلون الشمبانيا للمناسبات.",
      price: 21.0,
      discountPrice: 17.9,
      categoryId: cat.accessories,
      images: [img.heels],
      sizes: ["36", "37", "38", "39", "40"],
      colours: ["Champagne", "Black"],
      stock: 15,
      sku: "DD-AC-HEL-014",
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      nameEn: "Gold Layered Jewellery",
      nameAr: "مجوهرات ذهبية متعددة الطبقات",
      descriptionEn: "Layered necklace and hoop set with a soft gold finish.",
      descriptionAr: "طقم قلادة وحلق بطبقة ذهبية ناعمة.",
      price: 9.75,
      discountPrice: null,
      categoryId: cat.accessories,
      images: [img.jewelry],
      sizes: ["One Size"],
      colours: ["Gold"],
      stock: 34,
      sku: "DD-AC-JWL-015",
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      nameEn: "Silk Lifestyle Scarf",
      nameAr: "وشاح حريري",
      descriptionEn: "Lightweight silk scarf for modest styling and travel.",
      descriptionAr: "وشاح حريري خفيف للتنسيق المحتشم والسفر.",
      price: 8.5,
      discountPrice: 6.9,
      categoryId: cat.accessories,
      images: [img.scarf],
      sizes: ["One Size"],
      colours: ["Ivory", "Blush", "Black"],
      stock: 26,
      sku: "DD-AC-SCF-016",
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  const createdProducts = await prisma.product.findMany();

  await prisma.blog.createMany({
    data: [
      {
        slug: "kuwait-fashion-week-edit",
        titleEn: "Kuwait Season Edit: What to Wear Now",
        titleAr: "إطلالة الموسم في الكويت: ماذا ترتدين الآن",
        excerptEn: "Tailored layers, quiet luxury handbags and evening-ready silhouettes.",
        excerptAr: "طبقات مفصلة وحقائب فاخرة هادئة وإطلالات سهرة أنيقة.",
        contentEn:
          "Kuwait's social calendar calls for pieces that move from brunch in Salmiya to evenings in Kuwait City. This season Divine Drops focuses on breathable tailoring, champagne metallics and handbags that complete the look without excess.",
        contentAr:
          "أجندة الكويت الاجتماعية تتطلب قطعاً تنتقل بسلاسة من الصباح في السالمية إلى السهرات في مدينة الكويت. يركز ديفين دروبس هذا الموسم على القصات المريحة واللمسات الذهبية والحقائب التي تكتمل بها الإطلالة.",
        coverImage: img.blog1,
      },
      {
        slug: "beauty-essentials-desk-to-dinner",
        titleEn: "Beauty Essentials from Desk to Dinner",
        titleAr: "أساسيات الجمال من المكتب إلى العشاء",
        excerptEn: "A compact cosmetics edit that stays elegant in the heat.",
        excerptAr: "مجموعة تجميل مختصرة تبقى أنيقة في الأجواء الحارة.",
        contentEn:
          "Keep the ritual simple: hydrating skincare, a velvet lip and a palette of warm neutrals. Our beauty edit is designed for Gulf light, not runway theatrics.",
        contentAr:
          "اجعلي الروتين بسيطاً: عناية مرطبة، لون شفاه مخملي، ودرجات محايدة دافئة. مجموعة الجمال لدينا مصممة لإضاءة الخليج.",
        coverImage: img.blog2,
      },
      {
        slug: "the-handbag-that-travels",
        titleEn: "The Handbag That Travels Across Kuwait",
        titleAr: "حقيبة اليد التي ترافقك في الكويت",
        excerptEn: "How to choose one bag that works from Avenues to the corniche.",
        excerptAr: "كيف تختارين حقيبة واحدة من الأفنيوز إلى الكورنيش.",
        contentEn:
          "A structured quilted bag in black or champagne is the most versatile piece in a Kuwait wardrobe. Pair it with linen by day and silk after sunset.",
        contentAr:
          "الحقيبة المبطنة المنظمة بالأسود أو الشمبانيا هي القطعة الأكثر مرونة في خزانة الكويت. نسّقيها مع الكتان نهاراً والحرير مساءً.",
        coverImage: img.blog3,
      },
    ],
  });

  await prisma.review.createMany({
    data: [
      {
        customerName: "Nour Al-Sabah",
        rating: 5,
        commentEn: "The blazer and quilted bag arrived beautifully packed. True luxury for Kuwait.",
        commentAr: "وصل البليزر والحقيبة المبطنة بتغليف فاخر. تجربة راقية في الكويت.",
        productId: createdProducts[0].id,
        isApproved: true,
      },
      {
        customerName: "Layla Hassan",
        rating: 5,
        commentEn: "Sizes were accurate and the linen set is perfect for the weather.",
        commentAr: "المقاسات دقيقة وطقم الكتان مثالي للطقس.",
        productId: createdProducts[2].id,
        isApproved: true,
      },
      {
        customerName: "Omar Al-Kandari",
        rating: 4,
        commentEn: "Fast delivery to Hawalli. Cash on delivery was simple.",
        commentAr: "توصيل سريع إلى حولي والدفع عند الاستلام كان سهلاً.",
        productId: createdProducts[3].id,
        isApproved: true,
      },
    ],
  });

  await prisma.coupon.create({
    data: {
      code: "DIVINE10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      isActive: true,
    },
  });

  await prisma.setting.createMany({
    data: [
      { key: "deliveryFee", value: "2.000" },
      { key: "freeDeliveryThreshold", value: "50.000" },
      { key: "currency", value: "KWD" },
      { key: "market", value: "Kuwait" },
    ],
  });

  console.log("Divine Drops seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
