'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  AppShell,
  Group,
  Button,
  ActionIcon,
  useMantineColorScheme,
  Text,
  Menu,
  ScrollArea,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconWorld,
  IconMenu2,
  IconInfoCircle,
  IconCategory,
  IconChartBar,
  IconList,
  IconChevronDown,
  IconLanguage,
  IconCheck,
} from '@tabler/icons-react';
import { COUNTRIES_ARRAY, COUNTRIES, type SiteId } from '@/utils/constants';
import { useCategories } from '@/hooks/useCategories';
import { saveSelectedCategory, getSavedCategory } from '@/utils/storage';
import { useI18n } from '@/contexts/I18nContext';

interface HeaderProps {
  currentCountry?: SiteId;
  currentCategory?: string | null;
}

export function Header({ currentCountry, currentCategory }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t, locale, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);

  // Fetch categories for the current country
  const { data: categories, loading: loadingCategories } = useCategories({
    siteId: currentCountry || 'MLA',
  });

  // Load saved category from localStorage on mount
  useEffect(() => {
    setMounted(true);

    if (currentCountry && !currentCategory) {
      const savedCategory = getSavedCategory(currentCountry);
      if (savedCategory) {
        handleCategoryChange(savedCategory);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCountry]);

  const handleCountryChange = (value: string) => {
    // Preserve current page type (overview vs. list)
    const isOnOverviewPage = pathname?.includes('/overview');
    const basePath = `/trends/${value}`;
    const targetPath = isOnOverviewPage ? `${basePath}/overview` : basePath;

    router.push(targetPath);
  };

  const handleCategoryChange = (value: string | null) => {
    if (!currentCountry) return;

    // Save to localStorage
    saveSelectedCategory(currentCountry, value);

    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }

    const queryString = params.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newPath);
  };

  const countryOptions = COUNTRIES_ARRAY.map((country) => ({
    value: country.id,
    label: `${country.flag} ${country.name}`,
  }));

  const categoryOptions = categories
    ? [
        { value: '', label: t.header.allCategories },
        ...categories.map((cat) => ({
          value: cat.id,
          label: cat.name,
        })),
      ]
    : [{ value: '', label: t.header.allCategories }];

  // Show category filter only on trends pages (but not on overview)
  const isOverviewPage = pathname?.includes('/overview');
  const isTrendsListPage = pathname?.includes('/trends/') && !isOverviewPage;
  const showCategoryFilter = currentCountry && isTrendsListPage;
  const showOverviewToggle = currentCountry && pathname?.includes('/trends/');

  // Get current country display text
  const currentCountryDisplay = currentCountry
    ? `${COUNTRIES[currentCountry].flag} ${COUNTRIES[currentCountry].name}`
    : t.header.selectCountry;

  // Get current category display text
  const currentCategoryDisplay = currentCategory
    ? categories?.find((cat) => cat.id === currentCategory)?.name || t.header.allCategories
    : t.header.allCategories;

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        {/* Logo */}
        <Group
          gap="xs"
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/')}
        >
          <IconWorld size={28} style={{ color: 'var(--mantine-color-meliBlue-5)' }} />
          <Text
            size="xl"
            fw={700}
            style={{ color: 'var(--mantine-color-meliBlue-5)' }}
          >
            {t.header.appName}
          </Text>
        </Group>

        {/* Desktop: Country Menu + Category Menu + Language + Theme Toggle */}
        <Group gap="md" visibleFrom="sm">
          {/* Country Menu */}
          <Menu shadow="md" width={250} position="bottom-start">
            <Menu.Target>
              <Button
                variant="default"
                leftSection={<IconWorld size={18} />}
                rightSection={<IconChevronDown size={16} />}
              >
                {currentCountryDisplay}
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{t.header.countries}</Menu.Label>
              {countryOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onClick={() => handleCountryChange(option.value)}
                  bg={currentCountry === option.value ? 'var(--mantine-color-blue-light)' : undefined}
                  rightSection={currentCountry === option.value ? <IconCheck size={16} /> : null}
                >
                  {option.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>

          {/* Category Menu */}
          {showCategoryFilter && (
            <Menu shadow="md" width={300} position="bottom-start">
              <Menu.Target>
                <Button
                  variant="default"
                  leftSection={<IconCategory size={18} />}
                  rightSection={<IconChevronDown size={16} />}
                  disabled={loadingCategories}
                >
                  {loadingCategories ? t.header.loadingCategories : currentCategoryDisplay}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{t.header.categories}</Menu.Label>
                <ScrollArea.Autosize mah={400}>
                  {categoryOptions.map((option) => (
                    <Menu.Item
                      key={option.value}
                      onClick={() => handleCategoryChange(option.value || null)}
                      bg={currentCategory === option.value ? 'var(--mantine-color-blue-light)' : undefined}
                      rightSection={currentCategory === option.value ? <IconCheck size={16} /> : null}
                    >
                      {option.label}
                    </Menu.Item>
                  ))}
                </ScrollArea.Autosize>
              </Menu.Dropdown>
            </Menu>
          )}

          {/* Overview Toggle */}
          {showOverviewToggle && (
            <ActionIcon
              variant="subtle"
              onClick={() => {
                const targetPath = isOverviewPage
                  ? `/trends/${currentCountry}`
                  : `/trends/${currentCountry}/overview`;
                router.push(targetPath);
              }}
              size="lg"
              aria-label={isOverviewPage ? t.header.views.list : t.header.views.overview}
              title={isOverviewPage ? t.header.views.list : t.header.views.overview}
            >
              {isOverviewPage ? <IconList size={20} /> : <IconChartBar size={20} />}
            </ActionIcon>
          )}

          {/* Language Menu */}
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="lg"
                aria-label={t.header.language}
                title={t.header.language}
              >
                <IconLanguage size={20} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{t.header.language}</Menu.Label>
              <Menu.Item
                onClick={() => setLocale('en')}
                rightSection={locale === 'en' ? <IconCheck size={16} /> : null}
              >
                🇺🇸 {t.languages.en}
              </Menu.Item>
              <Menu.Item
                onClick={() => setLocale('es')}
                rightSection={locale === 'es' ? <IconCheck size={16} /> : null}
              >
                🇪🇸 {t.languages.es}
              </Menu.Item>
              <Menu.Item
                onClick={() => setLocale('pt-BR')}
                rightSection={locale === 'pt-BR' ? <IconCheck size={16} /> : null}
              >
                🇧🇷 {t.languages['pt-BR']}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Help */}
          <ActionIcon
            variant="subtle"
            onClick={() => router.push('/about')}
            size="lg"
            aria-label={t.header.help}
            title={t.header.help}
          >
            <IconInfoCircle size={20} />
          </ActionIcon>

          {/* Theme Toggle */}
          {mounted && (
            <ActionIcon
              variant="subtle"
              onClick={() => toggleColorScheme()}
              size="lg"
              aria-label={t.header.theme.toggle}
              title={colorScheme === 'dark' ? t.header.theme.light : t.header.theme.dark}
            >
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
          )}
        </Group>

        {/* Mobile: Hamburger Menu */}
        <Group hiddenFrom="sm">
          <Menu shadow="md" width={280} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" size="lg">
                <IconMenu2 size={20} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {/* Country Section */}
              <Menu.Label>{t.header.countries}</Menu.Label>
              {countryOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onClick={() => handleCountryChange(option.value)}
                  bg={currentCountry === option.value ? 'var(--mantine-color-blue-light)' : undefined}
                  rightSection={currentCountry === option.value ? <IconCheck size={16} /> : null}
                >
                  {option.label}
                </Menu.Item>
              ))}

              {/* Category Section - Only show if on trends page */}
              {showCategoryFilter && (
                <>
                  <Menu.Divider />
                  <Menu.Label>{t.header.categories}</Menu.Label>
                  <ScrollArea.Autosize mah={300}>
                    {loadingCategories ? (
                      <Menu.Item disabled>{t.header.loadingCategories}</Menu.Item>
                    ) : (
                      categoryOptions.map((option) => (
                        <Menu.Item
                          key={option.value}
                          onClick={() => handleCategoryChange(option.value || null)}
                          bg={currentCategory === option.value ? 'var(--mantine-color-blue-light)' : undefined}
                          rightSection={currentCategory === option.value ? <IconCheck size={16} /> : null}
                        >
                          {option.label}
                        </Menu.Item>
                      ))
                    )}
                  </ScrollArea.Autosize>
                </>
              )}

              <Menu.Divider />

              {/* Actions */}
              {showOverviewToggle && (
                <Menu.Item
                  leftSection={isOverviewPage ? <IconList size={18} /> : <IconChartBar size={18} />}
                  onClick={() => {
                    const targetPath = isOverviewPage
                      ? `/trends/${currentCountry}`
                      : `/trends/${currentCountry}/overview`;
                    router.push(targetPath);
                  }}
                >
                  {isOverviewPage ? t.header.views.list : t.header.views.overview}
                </Menu.Item>
              )}

              {/* Language Section */}
              <Menu.Divider />
              <Menu.Label>{t.header.language}</Menu.Label>
              <Menu.Item
                onClick={() => setLocale('en')}
                rightSection={locale === 'en' ? <IconCheck size={16} /> : null}
              >
                🇺🇸 {t.languages.en}
              </Menu.Item>
              <Menu.Item
                onClick={() => setLocale('es')}
                rightSection={locale === 'es' ? <IconCheck size={16} /> : null}
              >
                🇪🇸 {t.languages.es}
              </Menu.Item>
              <Menu.Item
                onClick={() => setLocale('pt-BR')}
                rightSection={locale === 'pt-BR' ? <IconCheck size={16} /> : null}
              >
                🇧🇷 {t.languages['pt-BR']}
              </Menu.Item>

              <Menu.Divider />

              {/* Help & Theme */}
              <Menu.Item
                leftSection={<IconInfoCircle size={18} />}
                onClick={() => router.push('/about')}
              >
                {t.header.help}
              </Menu.Item>

              {mounted && (
                <Menu.Item
                  leftSection={colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                  onClick={() => toggleColorScheme()}
                >
                  {colorScheme === 'dark' ? t.header.theme.light : t.header.theme.dark}
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
