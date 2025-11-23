'use client';

import { useRouter } from 'next/navigation';
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
} from '@tabler/icons-react';
import { COUNTRIES_ARRAY, type SiteId } from '@/utils/constants';

interface HeaderProps {
  currentCountry?: SiteId;
}

export function Header({ currentCountry }: HeaderProps) {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  // Only render theme toggle after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCountryChange = (value: string | null) => {
    if (value) {
      router.push(`/trends/${value}`);
    }
  };

  const countryOptions = COUNTRIES_ARRAY.map((country) => ({
    value: country.id,
    label: `${country.flag} ${country.name}`,
  }));

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

        {/* Desktop: Country Selector + Theme Toggle */}
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
