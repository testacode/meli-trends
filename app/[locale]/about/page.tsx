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
                {t('about.pageDescription', { count: <strong>50</strong> })}
              </Text>
            </Box>

            {/* Three Types of Trends */}
            <Box>
              <Title order={2} mb="lg">
                📊 {t('about.threeTypes.title')}
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                {t('about.threeTypes.description', {
                  badge: <strong>{t('about.threeTypes.badge')}</strong>
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
                    {t('about.threeTypes.fastestGrowing.description', {
                      highlight: <strong>{t('about.threeTypes.fastestGrowing.highlight')}</strong>
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
                    {t('about.threeTypes.mostWanted.description', {
                      highlight: <strong>{t('about.threeTypes.mostWanted.highlight')}</strong>
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
                    {t('about.threeTypes.mostPopular.description', {
                      highlight: <strong>{t('about.threeTypes.mostPopular.highlight')}</strong>
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
                      {t('about.businessStrategy.recommended.point1', {
                        label: <strong>{t('about.businessStrategy.recommended.label1')}</strong>
                      })}
                    </List.Item>
                    <List.Item>
                      {t('about.businessStrategy.recommended.point2', {
                        label: <strong>{t('about.businessStrategy.recommended.label2')}</strong>
                      })}
                    </List.Item>
                    <List.Item>
                      {t('about.businessStrategy.recommended.point3', {
                        label: <strong>{t('about.businessStrategy.recommended.label3')}</strong>
                      })}
                    </List.Item>
                  </List>
                </Box>

                <Box>
                  <Title order={4} mb="xs" c="meliBlue">
                    📈 {t('about.businessStrategy.searchVsConversion.title')}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {t('about.businessStrategy.searchVsConversion.description', {
                      highlight: <strong>{t('about.businessStrategy.searchVsConversion.highlight')}</strong>
                    })}
                  </Text>
                </Box>

                <Box>
                  <Title order={4} mb="xs" c="orange">
                    ⚡ {t('about.businessStrategy.emergingVsEstablished.title')}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {t('about.businessStrategy.emergingVsEstablished.emerging', {
                      label: <strong>{t('about.businessStrategy.emergingVsEstablished.label1')}</strong>
                    })}
                    <br />
                    {t('about.businessStrategy.emergingVsEstablished.established', {
                      label: <strong>{t('about.businessStrategy.emergingVsEstablished.label2')}</strong>
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
                  {t('about.categories.tip.description', {
                    fastest: <strong>{t('about.categories.tip.fastest')}</strong>,
                    popular: <strong>{t('about.categories.tip.popular')}</strong>
                  })}
                </Text>
              </Paper>
            </Box>

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
                    {t('about.faq.updateFrequency.answer', {
                      frequency: <strong>{t('about.faq.updateFrequency.frequency')}</strong>
                    })}
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="public">
                  <Accordion.Control>
                    {t('about.faq.publicData.question')}
                  </Accordion.Control>
                  <Accordion.Panel>
                    {t('about.faq.publicData.answer', {
                      type: <strong>{t('about.faq.publicData.type')}</strong>
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
                        {t('about.faq.difference.mostWanted', {
                          label: <strong>{t('about.faq.difference.label1')}</strong>
                        })}
                      </List.Item>
                      <List.Item>
                        {t('about.faq.difference.fastestGrowing', {
                          label: <strong>{t('about.faq.difference.label2')}</strong>
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
                    {t('about.faq.apiSource.answer', {
                      link: (
                        <Anchor
                          href="https://developers.mercadolibre.com.ar/en_us/trends"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('about.faq.apiSource.linkText')}
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
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
