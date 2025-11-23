import { describe, it, expect } from "vitest";
import {
  detectProductCategory,
  analyzeProductDistribution,
  analyzeByTrendType,
  PRODUCT_CATEGORY_LABELS,
} from "./productCategories";
import type { TrendItem } from "@/types/meli";

describe("productCategories", () => {
  describe("detectProductCategory", () => {
    it("should detect tech products", () => {
      expect(detectProductCategory("iphone 15 pro max")).toBe("tech");
      expect(detectProductCategory("samsung galaxy s24 ultra")).toBe("tech");
      expect(detectProductCategory("notebook lenovo")).toBe("tech");
      expect(detectProductCategory("playstation 5")).toBe("tech");
      expect(detectProductCategory("auriculares bluetooth")).toBe("tech");
    });

    it("should detect auto products", () => {
      expect(detectProductCategory("ford territory")).toBe("autos");
      expect(detectProductCategory("chevrolet onix")).toBe("autos");
      expect(detectProductCategory("toyota hilux")).toBe("autos");
      expect(detectProductCategory("renault arkana")).toBe("autos");
      expect(detectProductCategory("baic bj30")).toBe("autos");
    });

    it("should detect hogar products", () => {
      expect(detectProductCategory("heladera samsung")).toBe("hogar");
      expect(detectProductCategory("cocina gas")).toBe("hogar");
      expect(detectProductCategory("aire acondicionado")).toBe("hogar");
      expect(detectProductCategory("silla comedor")).toBe("hogar");
      expect(detectProductCategory("mesada topinera")).toBe("hogar");
    });

    it("should detect moda products", () => {
      expect(detectProductCategory("zapatillas nike")).toBe("moda");
      expect(detectProductCategory("adidas oasis hombre")).toBe("moda");
      expect(detectProductCategory("remera deportiva")).toBe("moda");
      expect(detectProductCategory("pantalon jean")).toBe("moda");
    });

    it("should detect belleza products", () => {
      expect(detectProductCategory("perfume erba pura")).toBe("belleza");
      expect(detectProductCategory("crema facial")).toBe("belleza");
      expect(detectProductCategory("athenea equipos de estetica")).toBe(
        "belleza"
      );
      expect(detectProductCategory("shampoo")).toBe("belleza");
    });

    it("should detect herramientas products", () => {
      expect(detectProductCategory("taladro inalambrico")).toBe(
        "herramientas"
      );
      expect(detectProductCategory("vibroapisonador wacker")).toBe(
        "herramientas"
      );
      expect(detectProductCategory("amoladora dewalt")).toBe("herramientas");
    });

    it("should handle case insensitive matching", () => {
      expect(detectProductCategory("IPHONE 15")).toBe("tech");
      expect(detectProductCategory("Samsung Galaxy")).toBe("tech");
      expect(detectProductCategory("FORD TERRITORY")).toBe("autos");
    });

    it("should handle accented characters", () => {
      expect(detectProductCategory("cafetera eléctrica")).toBe("hogar");
      expect(detectProductCategory("pantalón jean")).toBe("moda");
    });

    it("should return 'otros' for unmatched products", () => {
      expect(detectProductCategory("producto desconocido xyz")).toBe("otros");
      expect(detectProductCategory("test random product")).toBe("otros");
    });
  });

  describe("analyzeProductDistribution", () => {
    it("should analyze distribution correctly", () => {
      const trends: TrendItem[] = [
        { keyword: "iphone 15", url: "" },
        { keyword: "samsung galaxy s24", url: "" },
        { keyword: "ford territory", url: "" },
        { keyword: "zapatillas nike", url: "" },
        { keyword: "heladera samsung", url: "" },
      ];

      const distribution = analyzeProductDistribution(trends);

      expect(distribution).toHaveLength(4); // tech, autos, moda, hogar
      expect(distribution[0].category).toBe("tech");
      expect(distribution[0].count).toBe(2);
      expect(distribution[0].percentage).toBe(40);
      expect(distribution[0].label).toBe(PRODUCT_CATEGORY_LABELS.tech);
    });

    it("should handle empty trends array", () => {
      const distribution = analyzeProductDistribution([]);
      expect(distribution).toHaveLength(0);
    });

    it("should sort by count descending", () => {
      const trends: TrendItem[] = [
        { keyword: "iphone 15", url: "" },
        { keyword: "samsung galaxy", url: "" },
        { keyword: "xiaomi redmi", url: "" },
        { keyword: "ford territory", url: "" },
        { keyword: "zapatillas nike", url: "" },
      ];

      const distribution = analyzeProductDistribution(trends);

      expect(distribution[0].count).toBeGreaterThanOrEqual(
        distribution[1].count
      );
      if (distribution[2]) {
        expect(distribution[1].count).toBeGreaterThanOrEqual(
          distribution[2].count
        );
      }
    });

    it("should filter out categories with 0 count", () => {
      const trends: TrendItem[] = [
        { keyword: "iphone 15", url: "" },
        { keyword: "samsung galaxy", url: "" },
      ];

      const distribution = analyzeProductDistribution(trends);

      expect(distribution).toHaveLength(1); // Only tech
      expect(distribution.every((d) => d.count > 0)).toBe(true);
    });

    it("should calculate percentages correctly", () => {
      const trends: TrendItem[] = [
        { keyword: "iphone 15", url: "" },
        { keyword: "samsung galaxy", url: "" },
        { keyword: "xiaomi redmi", url: "" },
        { keyword: "ford territory", url: "" },
      ];

      const distribution = analyzeProductDistribution(trends);

      const totalPercentage = distribution.reduce(
        (sum, d) => sum + d.percentage,
        0
      );
      expect(totalPercentage).toBeLessThanOrEqual(100);
      expect(totalPercentage).toBeGreaterThanOrEqual(99); // Allow rounding differences
    });
  });

  describe("analyzeByTrendType", () => {
    it("should group and analyze by trend type", () => {
      const trends: TrendItem[] = [
        {
          keyword: "iphone 15",
          url: "",
          trend_type: "fastest_growing",
        },
        {
          keyword: "samsung galaxy",
          url: "",
          trend_type: "fastest_growing",
        },
        {
          keyword: "ford territory",
          url: "",
          trend_type: "most_wanted",
        },
        {
          keyword: "zapatillas nike",
          url: "",
          trend_type: "most_popular",
        },
      ];

      const analysis = analyzeByTrendType(trends);

      expect(analysis).toHaveLength(3); // 3 trend types

      const fastestGrowing = analysis.find(
        (a) => a.trendType === "fastest_growing"
      );
      expect(fastestGrowing).toBeDefined();
      expect(fastestGrowing?.distribution[0].category).toBe("tech");
      expect(fastestGrowing?.distribution[0].count).toBe(2);
    });

    it("should handle trends without trend_type", () => {
      const trends: TrendItem[] = [
        { keyword: "iphone 15", url: "" },
        { keyword: "samsung galaxy", url: "" },
      ];

      const analysis = analyzeByTrendType(trends);

      analysis.forEach((group) => {
        expect(group.distribution).toHaveLength(0);
      });
    });

    it("should return empty distributions for unused trend types", () => {
      const trends: TrendItem[] = [
        {
          keyword: "iphone 15",
          url: "",
          trend_type: "fastest_growing",
        },
      ];

      const analysis = analyzeByTrendType(trends);

      const mostWanted = analysis.find((a) => a.trendType === "most_wanted");
      expect(mostWanted?.distribution).toHaveLength(0);

      const mostPopular = analysis.find((a) => a.trendType === "most_popular");
      expect(mostPopular?.distribution).toHaveLength(0);
    });
  });

  describe("PRODUCT_CATEGORY_LABELS", () => {
    it("should have labels for all categories", () => {
      expect(PRODUCT_CATEGORY_LABELS.tech).toBe("📱 Tech");
      expect(PRODUCT_CATEGORY_LABELS.autos).toBe("🚗 Autos");
      expect(PRODUCT_CATEGORY_LABELS.hogar).toBe("🏠 Hogar");
      expect(PRODUCT_CATEGORY_LABELS.moda).toBe("👟 Moda");
      expect(PRODUCT_CATEGORY_LABELS.belleza).toBe("💄 Belleza");
      expect(PRODUCT_CATEGORY_LABELS.herramientas).toBe("🔧 Herramientas");
      expect(PRODUCT_CATEGORY_LABELS.otros).toBe("📦 Otros");
    });
  });
});
