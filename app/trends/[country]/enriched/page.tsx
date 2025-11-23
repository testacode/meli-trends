'use client';

import { use } from 'react';
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
import {
  IconAlertCircle,
  IconRefresh,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useTrends } from '@/hooks/useTrends';
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
    data: trendsData,
    loading,
    error,
    refetch,
  } = useTrends({
    siteId,
  });

  const trends = trendsData || [];

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="filled"
        >
          {error.message}
        </Alert>
        <Center mt="md">
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={refetch}
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
              onClick={refetch}
              variant="light"
              loading={loading}
            >
              Actualizar
            </Button>
          </Group>

          {/* Stats */}
          {trends.length > 0 && (
            <Group gap="md">
              <Badge size="lg" variant="light" color="blue">
                {trends.length} trends disponibles
              </Badge>
            </Group>
          )}

          {/* Info Alert */}
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Cómo funciona"
            color="blue"
            variant="light"
            mt="md"
          >
            Esta vista carga rápidamente los trends básicos. Para ver métricas
            detalladas (oportunidad de negocio, precios, ventas), haz click en
            el botón <strong>+</strong> en cada card.
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
              Las métricas se cargan bajo demanda para evitar bloqueos de la
              API.
            </Text>
          </Alert>
        </Box>

        {/* Loading first page */}
        {loading && trends.length === 0 && (
          <Center py={60}>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text c="dimmed">Cargando trends...</Text>
            </Stack>
          </Center>
        )}

        {/* Trends Grid */}
        {trends.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {trends.map((trend, index) => (
              <EnrichedTrendCard
                key={trend.keyword}
                trend={trend}
                rank={index + 1}
                siteId={siteId}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}
