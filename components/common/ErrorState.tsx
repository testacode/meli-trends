'use client';

import { Stack, Text, Button, Alert, Code } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import type { ApiError } from '@/types/meli';

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const getErrorMessage = (error: ApiError): string => {
    if (error.status === 401) {
      return 'Token inválido o expirado. Por favor, vuelve a iniciar sesión.';
    }
    if (error.status === 403) {
      return 'No tienes permiso para acceder a este recurso.';
    }
    if (error.status === 404) {
      return 'No se encontraron datos para este país o categoría.';
    }
    if (error.status === 429) {
      return 'Demasiadas solicitudes. Por favor, espera unos minutos e intenta nuevamente.';
    }
    if (error.status === 0) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
    return error.message || 'Ocurrió un error al cargar los datos.';
  };

  const showDetails = error.status !== 401 && error.status !== 403;

  return (
    <Stack align="center" justify="center" mih={400} gap="lg" p="xl">
      <Alert
        icon={<IconAlertCircle size={24} />}
        title="Error al cargar trends"
        color="red"
        variant="light"
        maw={600}
      >
        <Stack gap="sm">
          <Text size="sm">{getErrorMessage(error)}</Text>

          {showDetails && error.cause && (
            <Code block color="red" p="xs">
              {error.cause}
            </Code>
          )}

          {showDetails && (
            <Text size="xs" c="dimmed">
              Código de error: {error.status || 'N/A'}
            </Text>
          )}
        </Stack>
      </Alert>

      {onRetry && error.status !== 401 && error.status !== 403 && (
        <Button
          leftSection={<IconRefresh size={18} />}
          onClick={onRetry}
          variant="light"
          color="meliBlue"
        >
          Reintentar
        </Button>
      )}

      {(error.status === 401 || error.status === 403) && (
        <Button
          component="a"
          href="/"
          variant="filled"
          color="meliBlue"
        >
          Volver al inicio
        </Button>
      )}
    </Stack>
  );
}
