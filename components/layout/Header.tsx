'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  AppShell,
  Group,
  Select,
  ActionIcon,
  useMantineColorScheme,
  Text,
  Menu,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconWorld,
  IconMenu2,
  IconInfoCircle,
  IconCategory,
} from '@tabler/icons-react';
import { COUNTRIES_ARRAY, type SiteId } from '@/utils/constants';
import { useCategories } from '@/hooks/useCategories';

interface HeaderProps {
  currentCountry?: SiteId;
  currentCategory?: string | null;
}

export function Header({ currentCountry, currentCategory }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  // Fetch categories for the current country
  const { data: categories, loading: loadingCategories } = useCategories({
    siteId: currentCountry || 'MLA',
  });

  // Only render theme toggle after component mounts (client-side only)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleCountryChange = (value: string | null) => {
    if (value) {
      // Reset category when changing country
      router.push(`/trends/${value}`);
    }
  };

  const handleCategoryChange = (value: string | null) => {
    if (!currentCountry) return;

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
        { value: '', label: 'Todas las categorías' },
        ...categories.map((cat) => ({
          value: cat.id,
          label: cat.name,
        })),
      ]
    : [{ value: '', label: 'Todas las categorías' }];

  // Show category filter only on trends pages
  const showCategoryFilter = currentCountry && pathname?.includes('/trends/');

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
            MeLi Trends
          </Text>
        </Group>

        {/* Desktop: Country Selector + Category Filter + Theme Toggle */}
        <Group gap="md" visibleFrom="sm">
          <Select
            placeholder="Selecciona un país"
            data={countryOptions}
            value={currentCountry || null}
            onChange={handleCountryChange}
            leftSection={<IconWorld size={18} />}
            comboboxProps={{ withinPortal: false }}
            styles={{ input: { minWidth: 180 } }}
          />

          {showCategoryFilter && (
            <Select
              placeholder="Categoría"
              data={categoryOptions}
              value={currentCategory || ''}
              onChange={handleCategoryChange}
              leftSection={<IconCategory size={18} />}
              clearable
              searchable
              disabled={loadingCategories}
              comboboxProps={{ withinPortal: false }}
              styles={{ input: { minWidth: 200 } }}
            />
          )}

          <ActionIcon
            variant="subtle"
            onClick={() => router.push('/about')}
            size="lg"
            aria-label="Ayuda e información"
          >
            <IconInfoCircle size={20} />
          </ActionIcon>

          {mounted && (
            <ActionIcon
              variant="subtle"
              onClick={() => toggleColorScheme()}
              size="lg"
              aria-label="Toggle color scheme"
            >
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
          )}
        </Group>

        {/* Mobile: Menu */}
        <Group hiddenFrom="sm">
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" size="lg">
                <IconMenu2 size={20} />
              </ActionIcon>
            </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>País</Menu.Label>
            {countryOptions.map((option) => (
              <Menu.Item
                key={option.value}
                onClick={() => handleCountryChange(option.value)}
                bg={currentCountry === option.value ? 'var(--mantine-color-blue-light)' : undefined}
              >
                {option.label}
              </Menu.Item>
            ))}

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconInfoCircle size={18} />}
              onClick={() => router.push('/about')}
            >
              Ayuda e Información
            </Menu.Item>

            {mounted && (
              <Menu.Item
                leftSection={colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                onClick={() => toggleColorScheme()}
              >
                {colorScheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              </Menu.Item>
            )}
          </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
