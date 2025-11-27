"use client";

import { Suspense } from "react";
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
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconSearch,
  IconChartLine,
  IconInfoCircle,
  IconBulb,
  IconCategory,
  IconWorld,
  IconExternalLink,
  IconCode,
  IconClock,
  IconDatabase,
  IconApi,
  IconLock,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { AppShell } from "@mantine/core";
import { Header } from "@/components/layout/Header";

export default function AboutPage() {
  const t = useTranslations();
  const { colorScheme } = useMantineColorScheme();
  const tipBg = colorScheme === "dark" ? "gray.8" : "grape.2";

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
                {t('about.pageTitle')}
              </Title>
              <Text size="lg" c="dimmed">
                {t('about.pageDescription')}
              </Text>
            </Box>

            {/* Three Types of Trends */}
            <Box>
              <Title order={2} mb="lg">
                📊 {t('about.threeTypes.title')}
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                {t.rich('about.threeTypes.description', {
                  badge: (chunks) => <strong>{chunks}</strong>
                })}
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <ThemeIcon
                    size="xl"
                    radius="md"
                    variant="light"
                    color="red"
                    mb="md"
                  >
                    <IconChartLine size={28} />
                  </ThemeIcon>
                  <Title order={4} mb="xs">
                    🔴 {t('about.threeTypes.fastestGrowing.title')}
                  </Title>
                  <Text size="sm" c="dimmed" mb="xs">
                    {t.rich('about.threeTypes.fastestGrowing.description', {
                      highlight: (chunks) => <strong>{chunks}</strong>
                    })}
                  </Text>
                  <Badge color="red" variant="light" mt="md">
                    {t('about.threeTypes.fastestGrowing.positions')}
                  </Badge>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <ThemeIcon
                    size="xl"
                    radius="md"
                    variant="light"
                    color="blue"
                    mb="md"
                  >
                    <IconSearch size={28} />
                  </ThemeIcon>
                  <Title order={4} mb="xs">
                    🔵 {t('about.threeTypes.mostWanted.title')}
                  </Title>
                  <Text size="sm" c="dimmed" mb="xs">
                    {t.rich('about.threeTypes.mostWanted.description', {
                      highlight: (chunks) => <strong>{chunks}</strong>
                    })}
                  </Text>
                  <Badge color="blue" variant="light" mt="md">
                    {t('about.threeTypes.mostWanted.positions')}
                  </Badge>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <ThemeIcon
                    size="xl"
                    radius="md"
                    variant="light"
                    color="green"
                    mb="md"
                  >
                    <IconTrendingUp size={28} />
                  </ThemeIcon>
                  <Title order={4} mb="xs">
                    🟢 {t('about.threeTypes.mostPopular.title')}
                  </Title>
                  <Text size="sm" c="dimmed" mb="xs">
                    {t.rich('about.threeTypes.mostPopular.description', {
                      highlight: (chunks) => <strong>{chunks}</strong>
                    })}
                  </Text>
                  <Badge color="green" variant="light" mt="md">
                    {t('about.threeTypes.mostPopular.positions')}
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
                <Title order={2}>💡 {t('about.businessStrategy.title')}</Title>
              </Group>

              <Text size="md" mb="lg">
                {t('about.businessStrategy.question')}
              </Text>

              <Stack gap="md">
                <Box>
                  <Title order={4} mb="xs" c="green">
                    ✅ {t('about.businessStrategy.recommended.title')}
                  </Title>
                  <List spacing="xs" size="sm">
                    <List.Item>
                      {t.rich('about.businessStrategy.recommended.point1', {
                        label: (chunks) => <strong>{chunks}</strong>
                      })}
                    </List.Item>
                    <List.Item>
                      {t.rich('about.businessStrategy.recommended.point2', {
                        label: (chunks) => <strong>{chunks}</strong>
                      })}
                    </List.Item>
                    <List.Item>
                      {t.rich('about.businessStrategy.recommended.point3', {
                        label: (chunks) => <strong>{chunks}</strong>
                      })}
                    </List.Item>
                  </List>
                </Box>

                <Box>
                  <Title order={4} mb="xs" c="meliBlue">
                    📈 {t('about.businessStrategy.searchVsConversion.title')}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {t.rich('about.businessStrategy.searchVsConversion.description', {
                      highlight: (chunks) => <strong>{chunks}</strong>
                    })}
                  </Text>
                </Box>

                <Box>
                  <Title order={4} mb="xs" c="orange">
                    ⚡ {t('about.businessStrategy.emergingVsEstablished.title')}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {t.rich('about.businessStrategy.emergingVsEstablished.emerging', {
                      label: (chunks) => <strong>{chunks}</strong>
                    })}
                    <br />
                    {t.rich('about.businessStrategy.emergingVsEstablished.established', {
                      label: (chunks) => <strong>{chunks}</strong>
                    })}
                  </Text>
                </Box>
              </Stack>
            </Paper>

            {/* Countries Section */}
            <Box>
              <Group mb="md">
                <ThemeIcon
                  size="lg"
                  radius="md"
                  variant="light"
                  color="meliBlue"
                >
                  <IconWorld size={24} />
                </ThemeIcon>
                <Title order={2}>🌍 {t('about.countries.title')}</Title>
              </Group>

              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
                <Badge size="lg" variant="light" leftSection="🇦🇷">
                  {t('about.countries.argentina')}
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇧🇷">
                  {t('about.countries.brazil')}
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇨🇱">
                  {t('about.countries.chile')}
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇲🇽">
                  {t('about.countries.mexico')}
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇨🇴">
                  {t('about.countries.colombia')}
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇺🇾">
                  {t('about.countries.uruguay')}
                </Badge>
                <Badge size="lg" variant="light" leftSection="🇵🇪">
                  {t('about.countries.peru')}
                </Badge>
              </SimpleGrid>
            </Box>

            {/* Categories Section */}
            <Box>
              <Group mb="md">
                <ThemeIcon size="lg" radius="md" variant="light" color="grape">
                  <IconCategory size={24} />
                </ThemeIcon>
                <Title order={2}>📂 {t('about.categories.title')}</Title>
              </Group>

              <Text size="sm" mb="md">
                {t('about.categories.available')}
              </Text>

              <Text size="sm" c="dimmed" mb="md">
                {t('about.categories.exampleTitle')}
              </Text>

              <List spacing="xs" size="sm">
                <List.Item>
                  <strong>MLA1051</strong> - {t('about.categories.examples.phones')}
                </List.Item>
                <List.Item>
                  <strong>MLA1648</strong> - {t('about.categories.examples.computers')}
                </List.Item>
                <List.Item>
                  <strong>MLA1000</strong> - {t('about.categories.examples.electronics')}
                </List.Item>
                <List.Item>
                  <strong>MLA1144</strong> - {t('about.categories.examples.gaming')}
                </List.Item>
                <List.Item>
                  <strong>MLA1039</strong> - {t('about.categories.examples.cameras')}
                </List.Item>
              </List>

              <Paper
                shadow="xs"
                p="md"
                radius="md"
                withBorder
                mt="md"
                bg={tipBg}
              >
                <Text size="sm" fw={500} mb="xs">
                  💡 {t('about.categories.tip.title')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t.rich('about.categories.tip.description', {
                    fastest: (chunks) => <strong>{chunks}</strong>,
                    popular: (chunks) => <strong>{chunks}</strong>
                  })}
                </Text>
              </Paper>
            </Box>

            {/* API Technical Details Section */}
            <Paper shadow="xs" p="xl" radius="md" withBorder>
              <Group mb="md">
                <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                  <IconCode size={24} />
                </ThemeIcon>
                <Title order={2}>🔧 {t('about.apiTechnicalDetails.title')}</Title>
              </Group>

              <Text size="md" mb="lg" c="dimmed">
                {t('about.apiTechnicalDetails.description')}
              </Text>

              <Stack gap="lg">
                {/* Update Frequency */}
                <Box>
                  <Group gap="xs" mb="xs">
                    <ThemeIcon size="sm" radius="md" variant="light" color="blue">
                      <IconClock size={14} />
                    </ThemeIcon>
                    <Title order={4}>{t('about.apiTechnicalDetails.updateFrequency.title')}</Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {t.rich('about.apiTechnicalDetails.updateFrequency.description', {
                      frequency: (chunks) => <strong>{chunks}</strong>
                    })}
                  </Text>
                </Box>

                {/* Calculation Method */}
                <Box>
                  <Group gap="xs" mb="sm">
                    <ThemeIcon size="sm" radius="md" variant="light" color="orange">
                      <IconChartLine size={14} />
                    </ThemeIcon>
                    <Title order={4}>{t('about.apiTechnicalDetails.calculationMethod.title')}</Title>
                  </Group>
                  <Stack gap="xs">
                    <Paper p="sm" radius="sm" withBorder>
                      <Badge color="red" variant="light" mb="xs">
                        {t('about.apiTechnicalDetails.calculationMethod.fastestGrowing.label')}
                      </Badge>
                      <Text size="sm" c="dimmed">
                        {t.rich('about.apiTechnicalDetails.calculationMethod.fastestGrowing.description', {
                          period: (chunks) => <strong>{chunks}</strong>
                        })}
                      </Text>
                    </Paper>
                    <Paper p="sm" radius="sm" withBorder>
                      <Badge color="blue" variant="light" mb="xs">
                        {t('about.apiTechnicalDetails.calculationMethod.mostWanted.label')}
                      </Badge>
                      <Text size="sm" c="dimmed">
                        {t.rich('about.apiTechnicalDetails.calculationMethod.mostWanted.description', {
                          period: (chunks) => <strong>{chunks}</strong>
                        })}
                      </Text>
                    </Paper>
                    <Paper p="sm" radius="sm" withBorder>
                      <Badge color="green" variant="light" mb="xs">
                        {t('about.apiTechnicalDetails.calculationMethod.mostPopular.label')}
                      </Badge>
                      <Text size="sm" c="dimmed">
                        {t.rich('about.apiTechnicalDetails.calculationMethod.mostPopular.description', {
                          period: (chunks) => <strong>{chunks}</strong>
                        })}
                      </Text>
                    </Paper>
                  </Stack>
                </Box>

                {/* Data Structure */}
                <Box>
                  <Group gap="xs" mb="xs">
                    <ThemeIcon size="sm" radius="md" variant="light" color="teal">
                      <IconDatabase size={14} />
                    </ThemeIcon>
                    <Title order={4}>{t('about.apiTechnicalDetails.dataStructure.title')}</Title>
                  </Group>
                  <Text size="sm" c="dimmed" mb="xs">
                    {t.rich('about.apiTechnicalDetails.dataStructure.description', {
                      count: (chunks) => <strong>{chunks}</strong>
                    })}
                  </Text>
                  <List size="sm" spacing="xs">
                    <List.Item>
                      <Text component="span" ff="monospace" size="sm" c="violet">
                        {t('about.apiTechnicalDetails.dataStructure.keywordField')}
                      </Text>
                      {t.rich('about.apiTechnicalDetails.dataStructure.keyword', {
                        field: () => ':'
                      })}
                    </List.Item>
                    <List.Item>
                      <Text component="span" ff="monospace" size="sm" c="violet">
                        {t('about.apiTechnicalDetails.dataStructure.urlField')}
                      </Text>
                      {t.rich('about.apiTechnicalDetails.dataStructure.url', {
                        field: () => ':'
                      })}
                    </List.Item>
                  </List>
                </Box>

                {/* API Endpoints */}
                <Box>
                  <Group gap="xs" mb="xs">
                    <ThemeIcon size="sm" radius="md" variant="light" color="pink">
                      <IconApi size={14} />
                    </ThemeIcon>
                    <Title order={4}>{t('about.apiTechnicalDetails.endpoints.title')}</Title>
                  </Group>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                      • {t.rich('about.apiTechnicalDetails.endpoints.general', {
                        endpoint: () => (
                          <Text component="span" ff="monospace" size="sm" c="meliBlue">
                            {t('about.apiTechnicalDetails.endpoints.generalEndpoint')}
                          </Text>
                        )
                      })}
                    </Text>
                    <Text size="sm" c="dimmed">
                      • {t.rich('about.apiTechnicalDetails.endpoints.category', {
                        endpoint: () => (
                          <Text component="span" ff="monospace" size="sm" c="meliBlue">
                            {t('about.apiTechnicalDetails.endpoints.categoryEndpoint')}
                          </Text>
                        )
                      })}
                    </Text>
                    <Text size="sm" c="dimmed">
                      • {t.rich('about.apiTechnicalDetails.endpoints.example', {
                        endpoint: () => (
                          <Text component="span" ff="monospace" size="sm" c="meliBlue">
                            {t('about.apiTechnicalDetails.endpoints.exampleEndpoint')}
                          </Text>
                        )
                      })}
                    </Text>
                  </Stack>
                </Box>

                {/* Authentication */}
                <Box>
                  <Group gap="xs" mb="xs">
                    <ThemeIcon size="sm" radius="md" variant="light" color="gray">
                      <IconLock size={14} />
                    </ThemeIcon>
                    <Title order={4}>{t('about.apiTechnicalDetails.authentication.title')}</Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {t.rich('about.apiTechnicalDetails.authentication.description', {
                      auth: (chunks) => <strong>{chunks}</strong>
                    })}
                  </Text>
                </Box>
              </Stack>
            </Paper>

            {/* FAQ Section */}
            <Box>
              <Group mb="md">
                <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                  <IconInfoCircle size={24} />
                </ThemeIcon>
                <Title order={2}>❓ {t('about.faq.title')}</Title>
              </Group>

              <Accordion variant="separated">
                <Accordion.Item value="update">
                  <Accordion.Control>
                    {t('about.faq.updateFrequency.question')}
                  </Accordion.Control>
                  <Accordion.Panel>
                    {t.rich('about.faq.updateFrequency.answer', {
                      frequency: (chunks) => <strong>{chunks}</strong>
                    })}
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="public">
                  <Accordion.Control>
                    {t('about.faq.publicData.question')}
                  </Accordion.Control>
                  <Accordion.Panel>
                    {t.rich('about.faq.publicData.answer', {
                      type: (chunks) => <strong>{chunks}</strong>
                    })}
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="difference">
                  <Accordion.Control>
                    {t('about.faq.difference.question')}
                  </Accordion.Control>
                  <Accordion.Panel>
                    <List size="sm" spacing="xs">
                      <List.Item>
                        {t.rich('about.faq.difference.mostWanted', {
                          label: (chunks) => <strong>{chunks}</strong>
                        })}
                      </List.Item>
                      <List.Item>
                        {t.rich('about.faq.difference.fastestGrowing', {
                          label: (chunks) => <strong>{chunks}</strong>
                        })}
                      </List.Item>
                    </List>
                    <Text size="sm" mt="xs">
                      {t('about.faq.difference.conclusion')}
                    </Text>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="business">
                  <Accordion.Control>
                    {t('about.faq.business.question')}
                  </Accordion.Control>
                  <Accordion.Panel>
                    <List size="sm" spacing="xs">
                      <List.Item>
                        {t('about.faq.business.point1')}
                      </List.Item>
                      <List.Item>
                        {t('about.faq.business.point2')}
                      </List.Item>
                      <List.Item>
                        {t('about.faq.business.point3')}
                      </List.Item>
                      <List.Item>
                        {t('about.faq.business.point4')}
                      </List.Item>
                      <List.Item>
                        {t('about.faq.business.point5')}
                      </List.Item>
                    </List>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="api">
                  <Accordion.Control>
                    {t('about.faq.apiSource.question')}
                  </Accordion.Control>
                  <Accordion.Panel>
                    {t.rich('about.faq.apiSource.answer', {
                      link: (chunks) => (
                        <Anchor
                          href="https://developers.mercadolibre.com.ar/en_us/trends"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {chunks}
                          <IconExternalLink
                            size={14}
                            style={{ marginLeft: 4, verticalAlign: "middle" }}
                          />
                        </Anchor>
                      )
                    })}
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Box>

            {/* Resources Section */}
            <Paper shadow="xs" p="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                📚 {t('about.resources.title')}
              </Title>
              <List spacing="xs" size="sm">
                <List.Item>
                  <Anchor
                    href="https://developers.mercadolibre.com.ar/en_us/trends"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('about.resources.trendsApi')}
                    <IconExternalLink
                      size={14}
                      style={{ marginLeft: 4, verticalAlign: "middle" }}
                    />
                  </Anchor>
                </List.Item>
                <List.Item>
                  <Anchor
                    href="https://developers.mercadolibre.com.ar/en_us/categories-and-attributes"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('about.resources.categoriesApi')}
                    <IconExternalLink
                      size={14}
                      style={{ marginLeft: 4, verticalAlign: "middle" }}
                    />
                  </Anchor>
                </List.Item>
              </List>
            </Paper>

            {/* Footer */}
            <Text size="sm" c="dimmed" ta="center" mt="xl">
              {t('about.footer')}
              <br />
              {t('about.disclaimer')}
            </Text>

            {/* Dedication */}
            <Text size="sm" c="dimmed" ta="center" fs="italic" mt="md">
              Dedicado a mi amigo &quot;El Chango 💪&quot;
            </Text>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
