import type { TrendItem, TrendType } from "@/types/meli";

/**
 * Product category types
 */
export type ProductCategory =
  | "tech"
  | "autos"
  | "hogar"
  | "moda"
  | "belleza"
  | "herramientas"
  | "otros";

/**
 * Product category labels in Spanish
 */
export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  tech: "📱 Tech",
  autos: "🚗 Autos",
  hogar: "🏠 Hogar",
  moda: "👟 Moda",
  belleza: "💄 Belleza",
  herramientas: "🔧 Herramientas",
  otros: "📦 Otros",
};

/**
 * Keywords dictionary for product category detection
 */
const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  tech: [
    // Smartphones & tablets
    "iphone",
    "samsung",
    "xiaomi",
    "motorola",
    "huawei",
    "realme",
    "oppo",
    "oneplus",
    "pixel",
    "galaxy",
    "redmi",
    "poco",
    "redmagic",
    "phone",
    "celular",
    "smartphone",
    "tablet",
    "ipad",
    // Computers
    "notebook",
    "laptop",
    "macbook",
    "pc",
    "computadora",
    "monitor",
    "teclado",
    "mouse",
    "impresora",
    // Gaming
    "playstation",
    "xbox",
    "nintendo",
    "ps5",
    "ps4",
    "switch",
    "gaming",
    "gamer",
    // Audio/Video
    "auriculares",
    "airpods",
    "parlante",
    "smart tv",
    "television",
    "proyector",
    "soundbar",
    // Accessories
    "smartwatch",
    "watch",
    "reloj inteligente",
    "camara",
    "drone",
    "gopro",
    // Others
    "aiper",
    "aspiradora robot",
    "cargador",
    "cable",
  ],
  autos: [
    // Brands
    "ford",
    "chevrolet",
    "toyota",
    "volkswagen",
    "fiat",
    "renault",
    "peugeot",
    "honda",
    "hyundai",
    "nissan",
    "jeep",
    "ram",
    "baic",
    "chery",
    "geely",
    "mg",
    "citroen",
    // Types
    "auto",
    "camioneta",
    "pickup",
    "suv",
    "sedan",
    "territory",
    "ranger",
    "hilux",
    "corolla",
    "civic",
    // Parts
    "cubiertas",
    "neumaticos",
    "llantas",
    "bateria",
    "aceite",
    "filtro",
    "repuestos",
  ],
  hogar: [
    // Kitchen appliances
    "heladera",
    "refrigerador",
    "cocina",
    "horno",
    "microondas",
    "licuadora",
    "cafetera",
    "tostadora",
    "batidora",
    "procesadora",
    // Laundry
    "lavarropas",
    "secarropas",
    "lavadora",
    // Climate
    "aire acondicionado",
    "ventilador",
    "estufa",
    "calefactor",
    // Furniture
    "silla",
    "mesa",
    "sillon",
    "sofa",
    "cama",
    "placard",
    "escritorio",
    "estanteria",
    "mesada",
    // Home improvement
    "pintura",
    "lampara",
    "cortina",
    "alfombra",
    // Pool
    "piscina",
    "pileta",
    "astralpool",
  ],
  moda: [
    // Footwear
    "zapatillas",
    "zapatos",
    "botas",
    "sandalias",
    "ojotas",
    // Clothing
    "remera",
    "camiseta",
    "pantalon",
    "jean",
    "buzo",
    "campera",
    "chomba",
    "vestido",
    "pollera",
    "short",
    "jogging",
    // Brands
    "nike",
    "adidas",
    "puma",
    "reebok",
    "fila",
    "converse",
    "vans",
    "oasis",
    // Accessories
    "cartera",
    "mochila",
    "billetera",
    "cinturon",
    "gorra",
    "reloj",
  ],
  belleza: [
    // Perfumes
    "perfume",
    "fragancia",
    "colonia",
    "erba pura",
    // Skincare
    "crema",
    "serum",
    "protector solar",
    "hidratante",
    // Haircare
    "shampoo",
    "acondicionador",
    "tratamiento capilar",
    "secador",
    "plancha de pelo",
    // Makeup
    "maquillaje",
    "labial",
    "rimel",
    "base",
    "rubor",
    // Equipment
    "estetica",
    "athenea",
    "depiladora",
  ],
  herramientas: [
    // Power tools
    "taladro",
    "amoladora",
    "sierra",
    "atornillador",
    "soldadora",
    "compresor",
    // Hand tools
    "martillo",
    "destornillador",
    "llave",
    "alicate",
    "pinza",
    // Construction
    "vibroapisonador",
    "wacker",
    "cemento",
    "ladrillos",
    "arena",
    // Garden
    "cortadora de cesped",
    "bordeadora",
    "motosierra",
  ],
  otros: [],
};

/**
 * Normalize text for matching (lowercase, remove accents)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Detect product category based on keyword
 * Uses longest match to resolve conflicts (e.g., "heladera samsung" → hogar, not tech)
 */
export function detectProductCategory(keyword: string): ProductCategory {
  const normalized = normalizeText(keyword);

  let bestMatch: { category: ProductCategory; length: number } | null = null;

  // Check each category and find the longest matching keyword
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "otros") continue;

    for (const kw of keywords) {
      const normalizedKw = normalizeText(kw);
      if (normalized.includes(normalizedKw)) {
        // Keep the longest match (most specific)
        if (!bestMatch || normalizedKw.length > bestMatch.length) {
          bestMatch = {
            category: category as ProductCategory,
            length: normalizedKw.length,
          };
        }
      }
    }
  }

  return bestMatch ? bestMatch.category : "otros";
}

/**
 * Distribution statistics for a product category
 */
export type CategoryDistribution = {
  category: ProductCategory;
  label: string;
  count: number;
  percentage: number;
};

/**
 * Analyze product distribution for a list of trends
 */
export function analyzeProductDistribution(
  trends: TrendItem[]
): CategoryDistribution[] {
  // Count occurrences of each category
  const counts: Record<ProductCategory, number> = {
    tech: 0,
    autos: 0,
    hogar: 0,
    moda: 0,
    belleza: 0,
    herramientas: 0,
    otros: 0,
  };

  trends.forEach((trend) => {
    const category = detectProductCategory(trend.keyword);
    counts[category]++;
  });

  const total = trends.length;

  // Convert to distribution array
  const distribution: CategoryDistribution[] = Object.entries(counts)
    .map(([category, count]) => ({
      category: category as ProductCategory,
      label: PRODUCT_CATEGORY_LABELS[category as ProductCategory],
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .filter((item) => item.count > 0) // Only include categories with products
    .sort((a, b) => b.count - a.count); // Sort by count descending

  return distribution;
}

/**
 * Distribution statistics by trend type
 */
export type TrendTypeDistribution = {
  trendType: TrendType;
  distribution: CategoryDistribution[];
};

/**
 * Analyze product distribution grouped by trend type
 */
export function analyzeByTrendType(
  trends: TrendItem[]
): TrendTypeDistribution[] {
  const grouped: Record<TrendType, TrendItem[]> = {
    fastest_growing: [],
    most_wanted: [],
    most_popular: [],
  };

  // Group trends by type
  trends.forEach((trend) => {
    if (trend.trend_type) {
      grouped[trend.trend_type].push(trend);
    }
  });

  // Analyze each group
  return Object.entries(grouped).map(([trendType, items]) => ({
    trendType: trendType as TrendType,
    distribution: analyzeProductDistribution(items),
  }));
}
