'use client';

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
} from '@tabler/icons-react';
import { AppShell } from '@mantine/core';
import { Header } from '@/components/layout/Header';

export default function AboutPage() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header currentCountry="MLA" />

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
                Latinoamérica.
              </Text>
            </Box>

            {/* Three Types of Trends */}
            <Box>
              <Title order={2} mb="lg">
                📊 Tres Tipos de Métricas
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <ThemeIcon size="xl" radius="md" variant="light" color="green" mb="md">
                    <IconChartLine size={28} />
                  </ThemeIcon>
                  <Title order={4} mb="xs">
                    Fastest-Growing
                  </Title>
                  <Text size="sm" c="dimmed">
                    Productos con <strong>mayor aumento de revenue</strong> en la última semana.
                  </Text>
                  <Badge color="green" variant="light" mt="md">
                    Basado en ventas
                  </Badge>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <ThemeIcon size="xl" radius="md" variant="light" color="meliBlue" mb="md">
                    <IconSearch size={28} />
                  </ThemeIcon>
                  <Title order={4} mb="xs">
                    Most Wanted
                  </Title>
                  <Text size="sm" c="dimmed">
                    Productos con <strong>mayor volumen de búsquedas</strong> durante la última semana.
                  </Text>
                  <Badge color="meliBlue" variant="light" mt="md">
                    Basado en búsquedas
                  </Badge>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <ThemeIcon size="xl" radius="md" variant="light" color="yellow" mb="md">
                    <IconTrendingUp size={28} />
                  </ThemeIcon>
                  <Title order={4} mb="xs">
                    Most Popular
                  </Title>
                  <Text size="sm" c="dimmed">
                    Productos con <strong>mayor aumento de búsquedas</strong> comparado con hace 2 semanas.
                  </Text>
                  <Badge color="yellow" variant="light" mt="md">
                    Tendencia emergente
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
                      <strong>Most Wanted</strong> → Para conocer qué está "caliente" ahora (alta demanda)
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
                    Los productos con <strong>intención de compra clara</strong> (ej: "iphone 15 pro max
                    256gb") convierten mejor que búsquedas genéricas (ej: "celular"). Busca keywords
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
                <Title order={2}>📂 Categorías Principales (Ejemplo: Argentina)</Title>
              </Group>

              <Text size="sm" c="dimmed" mb="md">
                La API también permite filtrar trends por categoría. Estas son algunas categorías populares:
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

              <Text size="xs" c="dimmed" mt="md">
                Nota: Cada país tiene su propio conjunto de categorías. El filtrado por categoría estará
                disponible en futuras versiones.
              </Text>
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
                    ¿Cuál es la diferencia entre "más buscado" y "más vendido"?
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
                <List.Item>
                  <Anchor
                    href="https://github.com/testacode/meli-trends"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Código fuente de esta aplicación (GitHub)
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
