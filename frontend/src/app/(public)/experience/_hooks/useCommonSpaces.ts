'use client';

import { useEffect, useState } from 'react';
import { CommonSpaceDto, fetchCommonSpaces } from '../_api';

export function useCommonSpaces() {
  const [spaces, setSpaces] = useState<CommonSpaceDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommonSpaces()
      .then(setSpaces)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { spaces, loading };
}
