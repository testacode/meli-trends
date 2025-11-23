'use client';

import { Stack, Text, Button, Alert, Code } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import type { ApiError } from '@/types/meli';
import { useI18n } from '@/contexts/I18nContext';

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { t } = useI18n();

  const getErrorMessage = (error: ApiError): string => {
    if (error.status === 401) {
      return t.errors.status401;
    }
    if (error.status === 403) {
      return t.errors.status403;
    }
    if (error.status === 404) {
      return t.errors.status404;
    }
    if (error.status === 429) {
      return t.errors.status429;
    }
    if (error.status === 0) {
      return t.errors.status0;
    }
    return error.message || t.errors.defaultMessage;
  };

  const showDetails = error.status !== 401 && error.status !== 403;

  return (
    <Stack align="center" justify="center" mih={400} gap="lg" p="xl">
      <Alert
        icon={<IconAlertCircle size={24} />}
        title={t.errors.loadingTrends}
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
              {t.errors.errorCode}: {error.status || 'N/A'}
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
          {t.errors.retry}
        </Button>
      )}

      {(error.status === 401 || error.status === 403) && (
        <Button
          component="a"
          href="/"
          variant="filled"
          color="meliBlue"
        >
          {t.errors.backToHome}
        </Button>
      )}
    </Stack>
  );
}
