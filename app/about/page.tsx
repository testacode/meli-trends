'use client';

import { Suspense } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Accordion,
  List,
  ThemeIcon,
  SimpleGrid,
  Box,
  Anchor,
  Paper,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconSearch,
  IconChartLine,
  IconInfoCircle,
  IconBulb,
  IconCategory,
  IconWorld,
  IconExternalLink,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { AppShell } from '@mantine/core';
import { Header } from '@/components/layout/Header';

export default function AboutPage() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Suspense fallback={<AppShell.Header />}>
        <Header currentCountry="MLA" />
      </Suspense>

      <AppShell.Main>
        <Container size="lg" py="xl">
          <Stack gap="xl">
            {/* Hero Section */}
            <Box>
              <Title order={1} mb="md">
                ¿Qué son los MeLi Trends?
              </Title>
              <Text size="lg" c="dimmed">
                Los Trends de MercadoLibre muestran los <strong>50 productos más populares</strong> entre
                los usuarios. Esta información se actualiza semanalmente y está disponible para 7 países de
                Latinoamérica. Los trends se clasifican automáticamente en 3 tipos según su posición, y puedes
                filtrarlos por categoría para encontrar oportunidades específicas.
              </Text>
            </Box>

            {/* Three Types of Trends */}
            <Box>
              <Title order={2} mb="lg">
                📊 Tres Tipos de Trends (Clasificación Automática)
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                Los 50 trends se clasifican automáticamente según su posición en la respuesta de la API.
                Cada trend card muestra un <strong>badge de color</strong> indicando su tipo:
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <ThemeIcon size="xl" radius="md" variant="light" color="red" mb="md">
                    <IconChartLine size={28} />
                  </ThemeIcon>
                  <Title order={4} mb="xs">
                    🔴 Fastest-Growing
                  </Title>
                  <Text size="sm" c="dimmed" mb="xs">
                    Productos con <strong>mayor aumento de revenue</strong> en la última semana.
                  </Text>
                  <Badge color="red" variant="light" mt="md">
                    Posiciones 1-10
                  </Badge>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <ThemeIcon size="xl" radius="md" variant="light" color="blue" mb="md">
                    <IconSearch size={28} />
                  </ThemeIcon>
                  <Title order={4} mb="xs">
                    🔵 Most Wanted
                  </Title>
                  <Text size="sm" c="dimmed" mb="xs">
                    Productos con <strong>mayor volumen de búsquedas</strong> durante la última semana.
                  </Text>
                  <Badge color="blue" variant="light" mt="md">
                    Posiciones 11-30
                  </Badge>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <ThemeIcon size="xl" radius="md" variant="light" color="green" mb="md">
                    <IconTrendingUp size={28} />
                  </ThemeIcon>
                  <Title order={4} mb="xs">
                    🟢 Most Popular
                  </Title>
                  <Text size="sm" c="dimmed" mb="xs">
                    Productos con <strong>mayor aumento de búsquedas</strong> comparado con hace 2 semanas.
                  </Text>
                  <Badge color="green" variant="light" mt="md">
                    Posiciones 31-50
                  </Badge>
                </Card>
              </SimpleGrid>
            </Box>

            {/* Business Strategy Section */}
            <Paper shadow="xs" p="xl" radius="md" withBorder>
              <Group mb="md">
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconBulb size={24} />
                </ThemeIcon>
                <Title order={2}>💡 Estrategia de Negocio</Title>
              </Group>

              <Text size="md" mb="lg">
                ¿Qué conviene más para generar un comercio exitoso?
              </Text>

              <Stack gap="md">
                <Box>
                  <Title order={4} mb="xs" c="green">
                    ✅ Estrategia Recomendada: Combinar Métricas
                  </Title>
                  <List spacing="xs" size="sm">
                    <List.Item>
                      <strong>Most Wanted</strong> → Para conocer qué está &quot;caliente&quot; ahora (alta demanda)
                    </List.Item>
                    <List.Item>
                      <strong>Fastest-Growing</strong> → Para validar que SÍ se vende (no solo se busca)
                    </List.Item>
                    <List.Item>
                      <strong>Categorías específicas</strong> → Para encontrar nichos menos competidos
                    </List.Item>
                  </List>
                </Box>

                <Box>
                  <Title order={4} mb="xs" c="meliBlue">
                    📈 Volumen de Búsquedas vs. Conversión
                  </Title>
                  <Text size="sm" c="dimmed">
                    Los productos con <strong>intención de compra clara</strong> (ej: &quot;iphone 15 pro max
                    256gb&quot;) convierten mejor que búsquedas genéricas (ej: &quot;celular&quot;). Busca keywords
                    específicas dentro de los trends para mejores resultados.
                  </Text>
                </Box>

                <Box>
                  <Title order={4} mb="xs" c="orange">
                    ⚡ Productos Emergentes vs. Establecidos
                  </Title>
                  <Text size="sm" c="dimmed">
                    <strong>Most Popular</strong> (emergentes) = Menos competencia, mayor riesgo
                    <br />
                    <strong>Fastest-Growing</strong> (establecidos) = Más competencia, validados con ventas
                  </Text>
                </Box>
              </Stack>
            </Paper>

            {/* Countries Section */}
            <Box>
              <Group mb="md">
                <ThemeIcon size="lg" radius="md" variant="light" color="meliBlue">
                  <IconWorld size={24} />
                </ThemeIcon>
                <Title order={2}>🌍 Países Disponibles</Title>
              </Group>

              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
                <Badge size="lg" variant="light" leftSection="🇦🇷">
                  Argentina (MLA)
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇧🇷">
                  Brasil (MLB)
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇨🇱">
                  Chile (MLC)
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇲🇽">
                  México (MLM)
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇨🇴">
                  Colombia (MCO)
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇺🇾">
                  Uruguay (MLU)
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇵🇪">
                  Perú (MPE)
                </Badge>
              </SimpleGrid>
            </Box>

            {/* Categories Section */}
            <Box>
              <Group mb="md">
                <ThemeIcon size="lg" radius="md" variant="light" color="grape">
                  <IconCategory size={24} />
                </ThemeIcon>
                <Title order={2}>📂 Filtrado por Categorías</Title>
              </Group>

              <Text size="sm" mb="md">
                <strong>¡Ahora disponible!</strong> Puedes filtrar trends por categoría específica usando el
                dropdown en la parte superior de cualquier vista de trends. Esto te permite enfocarte en nichos
                específicos y encontrar oportunidades menos competidas.
              </Text>

              <Text size="sm" c="dimmed" mb="md">
                Ejemplo de categorías populares en Argentina:
              </Text>

              <List spacing="xs" size="sm">
                <List.Item>
                  <strong>MLA1051</strong> - Celulares y Teléfonos
                </List.Item>
                <List.Item>
                  <strong>MLA1648</strong> - Computación
                </List.Item>
                <List.Item>
                  <strong>MLA1000</strong> - Electrónica, Audio y Video
                </List.Item>
                <List.Item>
                  <strong>MLA1144</strong> - Consolas y Videojuegos
                </List.Item>
                <List.Item>
                  <strong>MLA1039</strong> - Cámaras y Accesorios
                </List.Item>
              </List>

              <Paper shadow="xs" p="md" radius="md" withBorder mt="md" bg="grape.0">
                <Text size="sm" fw={500} mb="xs">
                  💡 Tip: Combina categorías con tipos de trends
                </Text>
                <Text size="xs" c="dimmed">
                  Por ejemplo, filtra por &quot;Celulares y Teléfonos&quot; y busca productos en la sección{' '}
                  <strong>Fastest-Growing</strong> (primeros 10) para encontrar teléfonos que están vendiendo
                  bien. O busca en <strong>Most Popular</strong> (últimos 20) para identificar tendencias
                  emergentes en esa categoría.
                </Text>
              </Paper>
            </Box>

            {/* FAQ Section */}
            <Box>
              <Group mb="md">
                <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                  <IconInfoCircle size={24} />
                </ThemeIcon>
                <Title order={2}>❓ Preguntas Frecuentes</Title>
              </Group>

              <Accordion variant="separated">
                <Accordion.Item value="update">
                  <Accordion.Control>¿Con qué frecuencia se actualizan los trends?</Accordion.Control>
                  <Accordion.Panel>
                    Los trends se actualizan <strong>semanalmente</strong> por MercadoLibre. Nuestra
                    aplicación muestra los datos más recientes disponibles en la API oficial.
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="public">
                  <Accordion.Control>¿Los trends son datos públicos o privados?</Accordion.Control>
                  <Accordion.Panel>
                    Los trends son <strong>datos públicos/generales</strong> de MercadoLibre. Muestran los
                    mismos productos populares para todos los usuarios, no son personalizados ni requieren
                    login de usuario.
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="difference">
                  <Accordion.Control>
                    ¿Cuál es la diferencia entre &quot;más buscado&quot; y &quot;más vendido&quot;?
                  </Accordion.Control>
                  <Accordion.Panel>
                    <List size="sm" spacing="xs">
                      <List.Item>
                        <strong>Most Wanted (más buscado)</strong> - Refleja el volumen de búsquedas, lo que
                        la gente está buscando
                      </List.Item>
                      <List.Item>
                        <strong>Fastest-Growing (más vendido)</strong> - Refleja el crecimiento de revenue,
                        lo que realmente se está comprando
                      </List.Item>
                    </List>
                    <Text size="sm" mt="xs">
                      Un producto puede tener muchas búsquedas pero pocas ventas, o viceversa.
                    </Text>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="business">
                  <Accordion.Control>¿Cómo puedo usar esta información para mi negocio?</Accordion.Control>
                  <Accordion.Panel>
                    <List size="sm" spacing="xs">
                      <List.Item>
                        Identifica productos con alta demanda en tu país/categoría
                      </List.Item>
                      <List.Item>Descubre tendencias emergentes antes que tu competencia</List.Item>
                      <List.Item>
                        Valida ideas de productos viendo si tienen tracción real (ventas)
                      </List.Item>
                      <List.Item>Optimiza tu inventario basándote en demanda real</List.Item>
                      <List.Item>
                        Encuentra nichos específicos con menos competencia usando categorías
                      </List.Item>
                    </List>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="api">
                  <Accordion.Control>¿De dónde vienen estos datos?</Accordion.Control>
                  <Accordion.Panel>
                    Todos los datos provienen de la{' '}
                    <Anchor
                      href="https://developers.mercadolibre.com.ar/en_us/trends"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      API oficial de MercadoLibre Trends
                      <IconExternalLink size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                    </Anchor>
                    . La autenticación se maneja de forma segura en nuestro servidor, sin exponer
                    credenciales.
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Box>

            {/* System Status Section */}
            <Paper shadow="xs" p="xl" radius="md" withBorder>
              <Group mb="md">
                <ThemeIcon size="lg" radius="md" variant="light" color="yellow">
                  <IconAlertTriangle size={24} />
                </ThemeIcon>
                <Title order={2}>Estado Actual del Sistema</Title>
              </Group>

              <Accordion variant="separated">
                <Accordion.Item value="api-status">
                  <Accordion.Control>
                    <Text fw={500} c="orange">
                      Estado de la API de Búsqueda
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="sm">
                      <Text size="sm">
                        MercadoLibre ha restringido el acceso a su API de Búsqueda
                        (Search API) mediante CloudFront, bloqueando todas las
                        solicitudes con errores 403. Este problema afecta a
                        desarrolladores en todo el mundo desde <strong>abril 2025</strong>.
                      </Text>
                      <Text size="sm">
                        <strong>Estado actual:</strong>
                      </Text>
                      <List size="sm" spacing="xs">
                        <List.Item>
                          ✅ Los <strong>trends básicos</strong> (palabras clave) funcionan
                          normalmente
                        </List.Item>
                        <List.Item>
                          ❌ El <strong>enriquecimiento con datos de productos</strong> está
                          bloqueado
                        </List.Item>
                        <List.Item>
                          📧 Hemos contactado a MercadoLibre para resolver el problema
                        </List.Item>
                      </List>
                      <Text size="xs" c="dimmed" mt="xs">
                        Mientras tanto, puedes ver los trends básicos en la página
                        principal. Te notificaremos cuando la funcionalidad se
                        restablezca.
                      </Text>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="enrichment">
                  <Accordion.Control>
                    <Text fw={500}>
                      Funcionalidad de Enriquecimiento (temporalmente no disponible)
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="sm">
                      <Text size="sm">
                        La vista de trends enriquecidos carga rápidamente los trends básicos.
                        Para ver métricas detalladas (oportunidad de negocio, precios,
                        ventas), haz click en el botón <strong>+</strong> en cada card
                        cuando la funcionalidad esté disponible.
                      </Text>
                      <Text size="sm" fw={500}>
                        Métricas incluidas:
                      </Text>
                      <List size="sm" spacing="xs">
                        <List.Item>
                          <strong>Puntuación de oportunidad</strong> - Score 0-100 basado en
                          volumen de búsqueda, ventas, envío gratis y disponibilidad
                        </List.Item>
                        <List.Item>
                          <strong>Rango de precios</strong> - Precio mínimo, máximo y promedio
                          de los productos top
                        </List.Item>
                        <List.Item>
                          <strong>Ventas totales</strong> - Suma de unidades vendidas de los
                          productos principales
                        </List.Item>
                        <List.Item>
                          <strong>Envío gratis</strong> - Porcentaje de productos con envío
                          gratuito
                        </List.Item>
                      </List>
                      <Text size="xs" c="dimmed" mt="xs">
                        Las métricas se cargan bajo demanda para evitar bloqueos de la API.
                      </Text>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Paper>

            {/* Resources Section */}
            <Paper shadow="xs" p="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                📚 Recursos Útiles
              </Title>
              <List spacing="xs" size="sm">
                <List.Item>
                  <Anchor
                    href="https://developers.mercadolibre.com.ar/en_us/trends"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Documentación oficial de MercadoLibre Trends API
                    <IconExternalLink size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                  </Anchor>
                </List.Item>
                <List.Item>
                  <Anchor
                    href="https://developers.mercadolibre.com.ar/en_us/categories-and-attributes"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Categorías y Atributos de MercadoLibre
                    <IconExternalLink size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                  </Anchor>
                </List.Item>
              </List>
            </Paper>

            {/* Footer */}
            <Text size="sm" c="dimmed" ta="center" mt="xl">
              Esta aplicación fue creada para visualizar trends públicos de MercadoLibre.
              <br />
              No está afiliada ni respaldada oficialmente por MercadoLibre.
            </Text>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
