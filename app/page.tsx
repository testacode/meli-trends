'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader } from '@mantine/core';
import { DEFAULT_COUNTRY } from '@/utils/constants';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default country (no authentication required)
    router.push(`/trends/${DEFAULT_COUNTRY}`);
  }, [router]);

  // Show loader while redirecting
  return (
    <Center h="100vh">
      <Loader size="lg" color="meliBlue" />
    </Center>
  );
}
