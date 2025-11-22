'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader } from '@mantine/core';
import { useAuth } from '@/contexts/AuthContext';
import { TokenModal } from '@/components/auth/TokenModal';
import { DEFAULT_COUNTRY } from '@/utils/constants';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Once loading is done and user is authenticated, redirect to default country
    if (!isLoading && isAuthenticated) {
      router.push(`/trends/${DEFAULT_COUNTRY}`);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loader while checking authentication
  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" color="meliBlue" />
      </Center>
    );
  }

  // Show token modal if not authenticated
  if (!isAuthenticated) {
    return <TokenModal opened={true} />;
  }

  // Show loader while redirecting
  return (
    <Center h="100vh">
      <Loader size="lg" color="meliBlue" />
    </Center>
  );
}
