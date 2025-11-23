'use client';

import { useState } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Text,
  Anchor,
  Alert,
  Group,
  Title,
} from '@mantine/core';
import { IconKey, IconInfoCircle, IconExternalLink } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { DOCS_URLS } from '@/utils/constants';

interface TokenModalProps {
  opened: boolean;
  onClose?: () => void;
}

export function TokenModal({ opened, onClose }: TokenModalProps) {
  const { setToken } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateToken = (token: string): boolean => {
    // Basic validation: token should not be empty and should have reasonable length
    if (!token || token.trim().length === 0) {
      setError('El token no puede estar vacío');
      return false;
    }

    if (token.trim().length < 20) {
      setError('El token parece ser demasiado corto');
      return false;
    }

    // MercadoLibre tokens typically start with APP_USR or TG
    const trimmedToken = token.trim();
    if (!trimmedToken.startsWith('APP_USR') && !trimmedToken.startsWith('TG')) {
      setError('El token debe comenzar con APP_USR o TG');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    const trimmedToken = inputValue.trim();

    if (!validateToken(trimmedToken)) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Save token to context (which saves to localStorage)
      setToken(trimmedToken);

      // Close modal if callback provided
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError('Error al guardar el token. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        // Don't allow closing without token
        if (onClose) onClose();
      }}
      title={
        <Group gap="xs">
          <IconKey size={24} />
          <Title order={3}>Autenticación Requerida</Title>
        </Group>
      }
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      size="lg"
    >
      <Stack gap="md">
        <Alert icon={<IconInfoCircle size={20} />} color="blue" variant="light">
          <Text size="sm">
            Para usar MeLi Trends, necesitas un <strong>Access Token</strong> de
            MercadoLibre. Este token se guarda de forma segura en tu navegador y
            dura 6 horas.
          </Text>
        </Alert>

        <TextInput
          label="Access Token"
          placeholder="APP_USR-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxx"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.currentTarget.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          error={error}
          required
          size="md"
          leftSection={<IconKey size={18} />}
          description="Pega tu access token de MercadoLibre aquí"
        />

        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            ¿No tienes un Access Token?
          </Text>
          <Group gap="xs">
            <Anchor
              href={DOCS_URLS.authentication}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
            >
              Ver guía de autenticación
              <IconExternalLink size={14} style={{ marginLeft: 4 }} />
            </Anchor>
            <Text size="sm" c="dimmed">•</Text>
            <Anchor
              href={DOCS_URLS.main}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
            >
              MercadoLibre Developers
              <IconExternalLink size={14} style={{ marginLeft: 4 }} />
            </Anchor>
          </Group>
        </Stack>

        <Button
          onClick={handleSubmit}
          loading={isSubmitting}
          fullWidth
          size="md"
          color="meliBlue"
        >
          Conectar
        </Button>
      </Stack>
    </Modal>
  );
}
