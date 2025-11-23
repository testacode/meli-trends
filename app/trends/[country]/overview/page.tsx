"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AppShell,
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Button,
  Box,
  SegmentedControl,
  Transition,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useTrends } from "@/hooks/useTrends";
import { Header } from "@/components/layout/Header";
import { OverviewSkeleton } from "@/components/common/OverviewSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { CategoryColumn } from "@/components/trends/CategoryColumn";
import { COUNTRIES, type SiteId } from "@/utils/constants";
import type { TrendType } from "@/types/meli";
import { analyzeProductDistribution } from "@/utils/productCategories";
import { fadeSlide } from "@/lib/transitions";

export default function TrendsOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const country = params.country as SiteId;

  // Media query for responsive behavior
  const isMobile = useMediaQuery("(max-width: 768px)");

  // State for mobile tab switching
  const [activeTab, setActiveTab] = useState<TrendType>("fastest_growing");

  // Segment data for mobile view
  const segmentData = [
    { label: "🚀 Rápido", value: "fastest_growing" },
    { label: "🔍 Buscado", value: "most_wanted" },
    { label: "⭐ Popular", value: "most_popular" },
  ];

  // Validate country
  const isValidCountry = country && country in COUNTRIES;

  // Fetch trends
  const { data, loading, error, refetch } = useTrends({
    siteId: country,
  });

  // Filter trends by type
  const trendsByType = useMemo(() => {
    if (!data) {
      return {
        fastest_growing: [],
        most_wanted: [],
        most_popular: [],
      };
    }

    return {
      fastest_growing: data.filter(
        (trend) => trend.trend_type === "fastest_growing"
      ),
      most_wanted: data.filter((trend) => trend.trend_type === "most_wanted"),
      most_popular: data.filter((trend) => trend.trend_type === "most_popular"),
    };
  }, [data]);

  // Analyze product distribution for each category
  const distributions = useMemo(() => {
    return {
      fastest_growing: analyzeProductDistribution(
        trendsByType.fastest_growing
      ),
      most_wanted: analyzeProductDistribution(trendsByType.most_wanted),
      most_popular: analyzeProductDistribution(trendsByType.most_popular),
    };
  }, [trendsByType]);

  // Redirect to default country if invalid
  useEffect(() => {
    if (!isValidCountry) {
      router.push("/");
    }
  }, [isValidCountry, router]);

  // Show nothing if invalid country (will redirect)
  if (!isValidCountry) {
    return null;
  }

  const countryData = COUNTRIES[country];

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header currentCountry={country} />

      <AppShell.Main>
        <Container size="xl" py="xl">
          {/* Page Header */}
          <Stack gap="lg" mb="xl">
            <Box>
              <Button
                component={Link}
                href={`/trends/${country}`}
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                size="sm"
              >
                Volver a vista lista
              </Button>
            </Box>

            <Stack gap="xs">
              <Title order={1}>
                {countryData.flag} Análisis de Tendencias en{" "}
                {countryData.name}
              </Title>
              <Text size="lg" c="dimmed">
                Vista por categorías con análisis de tipos de productos
              </Text>
            </Stack>
          </Stack>

          {/* Loading State */}
          {loading && <OverviewSkeleton />}

          {/* Error State */}
          {error && !loading && <ErrorState error={error} onRetry={refetch} />}

          {/* Content - Responsive Layout with Transition */}
          <Transition
            mounted={!loading && !error && !!data}
            transition={fadeSlide}
            duration={300}
            timingFunction="ease-out"
          >
            {(styles) => (
              <div style={styles}>
                {data && !loading && !error && (
                  <>
                    {isMobile ? (
                      // Mobile: SegmentedControl + Single Column View
                      <Stack gap="lg">
                        <SegmentedControl
                          value={activeTab}
                          onChange={(value) => setActiveTab(value as TrendType)}
                          data={segmentData}
                          fullWidth
                          color="meliBlue"
                          size="md"
                        />

                        {activeTab === "fastest_growing" && (
                          <CategoryColumn
                            trendType="fastest_growing"
                            trends={trendsByType.fastest_growing}
                            distribution={distributions.fastest_growing}
                          />
                        )}

                        {activeTab === "most_wanted" && (
                          <CategoryColumn
                            trendType="most_wanted"
                            trends={trendsByType.most_wanted}
                            distribution={distributions.most_wanted}
                          />
                        )}

                        {activeTab === "most_popular" && (
                          <CategoryColumn
                            trendType="most_popular"
                            trends={trendsByType.most_popular}
                            distribution={distributions.most_popular}
                          />
                        )}
                      </Stack>
                    ) : (
                      // Desktop: 3-Column Grid Layout
                      <SimpleGrid
                        cols={{ base: 1, md: 3 }}
                        spacing="lg"
                        style={{ alignItems: "start" }}
                      >
                        <CategoryColumn
                          trendType="fastest_growing"
                          trends={trendsByType.fastest_growing}
                          distribution={distributions.fastest_growing}
                        />

                        <CategoryColumn
                          trendType="most_wanted"
                          trends={trendsByType.most_wanted}
                          distribution={distributions.most_wanted}
                        />

                        <CategoryColumn
                          trendType="most_popular"
                          trends={trendsByType.most_popular}
                          distribution={distributions.most_popular}
                        />
                      </SimpleGrid>
                    )}
                  </>
                )}
              </div>
            )}
          </Transition>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
