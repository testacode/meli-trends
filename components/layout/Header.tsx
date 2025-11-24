'use client';

import { useSearchParams, usePathname as useNextPathname } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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
  IconSettings,
  IconLayout,
} from '@tabler/icons-react';
import { COUNTRIES_ARRAY, COUNTRIES, type SiteId } from '@/utils/constants';
import { useCategories } from '@/hooks/useCategories';
import { saveSelectedCategory, getSavedCategory, saveViewMode, getViewMode, type ViewMode } from '@/utils/storage';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

interface HeaderProps {
  currentCountry?: SiteId;
  currentCategory?: string | null;
}

export function Header({ currentCountry, currentCategory }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextPathname = useNextPathname(); // For locale switching
  const searchParams = useSearchParams();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');

  // Fetch categories for the current country
  const { data: categories, loading: loadingCategories } = useCategories({
    siteId: currentCountry || 'MLA',
  });

  // Load saved category and view mode from localStorage on mount
  useEffect(() => {
    setMounted(true);

    // Load saved view mode
    const savedViewMode = getViewMode();
    setViewMode(savedViewMode);

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

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    saveViewMode(mode);
    // Trigger a re-render by forcing the page to reload
    window.location.reload();
  };

  const countryOptions = COUNTRIES_ARRAY.map((country) => ({
    value: country.id,
    label: `${country.flag} ${country.name}`,
  }));

  const categoryOptions = categories
    ? [
        { value: '', label: t('header.allCategories') },
        ...categories.map((cat) => ({
          value: cat.id,
          label: cat.name,
        })),
      ]
    : [{ value: '', label: t('header.allCategories') }];

  // Show category filter only on trends pages (but not on overview)
  const isOverviewPage = pathname?.includes('/overview');
  const isTrendsListPage = pathname?.includes('/trends/') && !isOverviewPage;
  const showCategoryFilter = currentCountry && isTrendsListPage;
  const showOverviewToggle = currentCountry && pathname?.includes('/trends/');

  // Get current country display text
  const currentCountryDisplay = currentCountry
    ? `${COUNTRIES[currentCountry].flag} ${COUNTRIES[currentCountry].name}`
    : t('header.selectCountry');

  // Get current category display text
  const currentCategoryDisplay = currentCategory
    ? categories?.find((cat) => cat.id === currentCategory)?.name || t('header.allCategories')
    : t('header.allCategories');

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
            ML
          </Text>
        </Group>

        {/* Desktop/Tablet: Navigation with Settings menu */}
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
              <Menu.Label>{t('header.countries')}</Menu.Label>
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
                  {loadingCategories ? t('header.loadingCategories') : currentCategoryDisplay}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{t('header.categories')}</Menu.Label>
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
            <Button
              variant="subtle"
              leftSection={isOverviewPage ? <IconList size={18} /> : <IconChartBar size={18} />}
              onClick={() => {
                const targetPath = isOverviewPage
                  ? `/trends/${currentCountry}`
                  : `/trends/${currentCountry}/overview`;
                router.push(targetPath);
              }}
            >
              {isOverviewPage ? t('header.views.list') : t('header.views.overview')}
            </Button>
          )}

          {/* Settings Menu - Consolidated */}
          <Menu shadow="md" width={250} position="bottom-end">
            <Menu.Target>
              <Button
                variant="subtle"
                leftSection={<IconSettings size={18} />}
                rightSection={<IconChevronDown size={14} />}
              >
                {t('header.settings')}
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              {/* Language Submenu */}
              <Menu.Sub>
                <Menu.Sub.Target>
                  <Menu.Sub.Item leftSection={<IconLanguage size={18} />}>
                    {t('header.language')}
                  </Menu.Sub.Item>
                </Menu.Sub.Target>
                <Menu.Sub.Dropdown>
                  {locales.map((loc) => (
                    <Menu.Item
                      key={loc}
                      component="a"
                      href={`/${loc}${nextPathname.replace(/^\/(en|es|pt-BR)/, '')}`}
                      rightSection={locale === loc ? <IconCheck size={16} /> : null}
                    >
                      {localeFlags[loc]} {localeNames[loc]}
                    </Menu.Item>
                  ))}
                </Menu.Sub.Dropdown>
              </Menu.Sub>

              {/* View Mode Submenu */}
              {mounted && (
                <Menu.Sub>
                  <Menu.Sub.Target>
                    <Menu.Sub.Item leftSection={<IconLayout size={18} />}>
                      {t('header.viewMode.title')}
                    </Menu.Sub.Item>
                  </Menu.Sub.Target>
                  <Menu.Sub.Dropdown>
                    <Menu.Item
                      onClick={() => handleViewModeChange('gallery')}
                      rightSection={viewMode === 'gallery' ? <IconCheck size={16} /> : null}
                    >
                      {t('header.viewMode.gallery')}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => handleViewModeChange('table')}
                      rightSection={viewMode === 'table' ? <IconCheck size={16} /> : null}
                    >
                      {t('header.viewMode.table')}
                    </Menu.Item>
                  </Menu.Sub.Dropdown>
                </Menu.Sub>
              )}

              {/* Theme Toggle - Direct item */}
              {mounted && (
                <Menu.Item
                  leftSection={colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                  onClick={() => toggleColorScheme()}
                >
                  {colorScheme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
                </Menu.Item>
              )}

              {/* Help - Direct item */}
              <Menu.Item
                leftSection={<IconInfoCircle size={18} />}
                onClick={() => router.push('/about')}
              >
                {t('header.help')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
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
              {/* Country Submenu */}
              <Menu.Sub>
                <Menu.Sub.Target>
                  <Menu.Sub.Item leftSection={<IconWorld size={18} />}>
                    {t('header.countries')}
                  </Menu.Sub.Item>
                </Menu.Sub.Target>
                <Menu.Sub.Dropdown>
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
                </Menu.Sub.Dropdown>
              </Menu.Sub>

              {/* Category Submenu - Only show if on trends page */}
              {showCategoryFilter && (
                <Menu.Sub>
                  <Menu.Sub.Target>
                    <Menu.Sub.Item leftSection={<IconCategory size={18} />}>
                      {t('header.categories')}
                    </Menu.Sub.Item>
                  </Menu.Sub.Target>
                  <Menu.Sub.Dropdown>
                    <ScrollArea.Autosize mah={300}>
                      {loadingCategories ? (
                        <Menu.Item disabled>{t('header.loadingCategories')}</Menu.Item>
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
                  </Menu.Sub.Dropdown>
                </Menu.Sub>
              )}

              {/* Language Submenu */}
              <Menu.Sub>
                <Menu.Sub.Target>
                  <Menu.Sub.Item leftSection={<IconLanguage size={18} />}>
                    {t('header.language')}
                  </Menu.Sub.Item>
                </Menu.Sub.Target>
                <Menu.Sub.Dropdown>
                  {locales.map((loc) => (
                    <Menu.Item
                      key={loc}
                      component="a"
                      href={`/${loc}${nextPathname.replace(/^\/(en|es|pt-BR)/, '')}`}
                      rightSection={locale === loc ? <IconCheck size={16} /> : null}
                    >
                      {localeFlags[loc]} {localeNames[loc]}
                    </Menu.Item>
                  ))}
                </Menu.Sub.Dropdown>
              </Menu.Sub>

              {/* View Mode Submenu */}
              {mounted && (
                <Menu.Sub>
                  <Menu.Sub.Target>
                    <Menu.Sub.Item leftSection={<IconLayout size={18} />}>
                      {t('header.viewMode.title')}
                    </Menu.Sub.Item>
                  </Menu.Sub.Target>
                  <Menu.Sub.Dropdown>
                    <Menu.Item
                      onClick={() => handleViewModeChange('gallery')}
                      rightSection={viewMode === 'gallery' ? <IconCheck size={16} /> : null}
                    >
                      {t('header.viewMode.gallery')}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => handleViewModeChange('table')}
                      rightSection={viewMode === 'table' ? <IconCheck size={16} /> : null}
                    >
                      {t('header.viewMode.table')}
                    </Menu.Item>
                  </Menu.Sub.Dropdown>
                </Menu.Sub>
              )}

              <Menu.Divider />

              {/* Direct Actions */}
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
                  {isOverviewPage ? t('header.views.list') : t('header.views.overview')}
                </Menu.Item>
              )}

              <Menu.Item
                leftSection={<IconInfoCircle size={18} />}
                onClick={() => router.push('/about')}
              >
                {t('header.help')}
              </Menu.Item>

              {mounted && (
                <Menu.Item
                  leftSection={colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                  onClick={() => toggleColorScheme()}
                >
                  {colorScheme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
