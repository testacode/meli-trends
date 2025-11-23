'use client';

import { use, useEffect, useRef } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Loader,
  Center,
  Alert,
  Badge,
  Group,
  Button,
  Box,
} from '@mantine/core';
import { useIntersection } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconRefresh,
  IconDatabase,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useEnrichedTrends } from '@/hooks/useEnrichedTrends';
import { EnrichedTrendCard } from '@/components/trends/EnrichedTrendCard';
import { COUNTRIES } from '@/utils/constants';
import type { SiteId } from '@/types/meli';

interface PageProps {
  params: Promise<{
    country: string;
  }>;
}

export default function EnrichedTrendsPage({ params }: PageProps) {
  const { country } = use(params);
  const siteId = country as SiteId;
  const countryData = COUNTRIES[siteId];

  const {
    trends,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total,
    cacheAge,
  } = useEnrichedTrends({
    siteId,
    limit: 10,
    autoLoad: true,
  });

  // Infinite scroll with useIntersection
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: lastItemRef, entry } = useIntersection({
    root: containerRef.current,
    threshold: 0.5,
  });

  // Trigger loadMore when last item is visible
  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !loading) {
      console.log('🔄 Infinite scroll triggered');
      loadMore();
    }
  }, [entry?.isIntersecting, hasMore, loading, loadMore]);

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
        <Center mt="md">
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={refresh}
            variant="light"
          >
            Reintentar
          </Button>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Group justify="space-between" align="flex-start" mb="md">
            <Box>
              <Group gap="xs" mb="xs">
                <Title order={1}>
                  {countryData.flag} Tendencias Enriquecidas - {countryData.name}
                </Title>
              </Group>
              <Text size="lg" c="dimmed">
                Análisis detallado de los productos más buscados con métricas de
                negocio
              </Text>
            </Box>

            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={refresh}
              variant="light"
              loading={loading && trends.length === 0}
            >
              Actualizar
            </Button>
          </Group>

          {/* Stats */}
          <Group gap="md">
            {total > 0 && (
              <Badge size="lg" variant="light" color="blue">
                {trends.length} de {total} trends cargados
              </Badge>
            )}
            {cacheAge && (
              <Badge
                size="lg"
                variant="light"
                color="gray"
                leftSection={<IconDatabase size={14} />}
              >
                Cache: {cacheAge}
              </Badge>
            )}
          </Group>

          {/* Info Alert */}
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Sobre los datos enriquecidos"
            color="blue"
            variant="light"
            mt="md"
          >
            Esta vista muestra datos adicionales para cada trend:
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>
                <strong>Puntuación de oportunidad</strong>: Score 0-100 basado
                en volumen de búsqueda, ventas, envío gratis y disponibilidad
              </li>
              <li>
                <strong>Rango de precios</strong>: Precio mínimo, máximo y
                promedio de los productos top
              </li>
              <li>
                <strong>Ventas totales</strong>: Suma de unidades vendidas de
                los productos principales
              </li>
              <li>
                <strong>Envío gratis</strong>: Porcentaje de productos con envío
                gratuito
              </li>
            </ul>
            <Text size="xs" mt="xs" c="dimmed">
              Los datos se cachean por 24 horas para optimizar el uso de la API.
            </Text>
          </Alert>
        </Box>

        {/* Loading first page */}
        {loading && trends.length === 0 && (
          <Center py={60}>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text c="dimmed">
                Cargando trends enriquecidos...
              </Text>
              <Text size="sm" c="dimmed">
                Esto puede tardar unos segundos mientras obtenemos datos de
                productos
              </Text>
            </Stack>
          </Center>
        )}

        {/* Trends Grid */}
        {trends.length > 0 && (
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3 }}
            spacing="lg"
            ref={containerRef}
          >
            {trends.map((trend, index) => (
              <div
                key={trend.keyword}
                ref={index === trends.length - 1 ? lastItemRef : undefined}
              >
                <EnrichedTrendCard trend={trend} rank={index + 1} />
              </div>
            ))}
          </SimpleGrid>
        )}

        {/* Loading more */}
        {loading && trends.length > 0 && (
          <Center py="md">
            <Stack align="center" gap="xs">
              <Loader size="md" />
              <Text size="sm" c="dimmed">
                Cargando más trends...
              </Text>
            </Stack>
          </Center>
        )}

        {/* No more items */}
        {!loading && !hasMore && trends.length > 0 && (
          <Center py="md">
            <Text size="sm" c="dimmed">
              ✅ Has visto todos los trends disponibles ({total})
            </Text>
          </Center>
        )}

        {/* Load More Button (fallback if intersection doesn't work) */}
        {hasMore && !loading && trends.length > 0 && (
          <Center>
            <Button
              onClick={loadMore}
              variant="light"
              size="lg"
            >
              Cargar más trends
            </Button>
          </Center>
        )}
      </Stack>
    </Container>
  );
}
