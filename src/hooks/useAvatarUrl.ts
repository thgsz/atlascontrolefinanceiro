import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

function extractPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const marker = '/avatars/';
  const idx = value.indexOf(marker);
  if (idx >= 0) {
    const rest = value.slice(idx + marker.length);
    return rest.split('?')[0];
  }
  return value.split('?')[0];
}

export function useAvatarUrl(avatarUrl: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const path = extractPath(avatarUrl);
    if (!path) {
      setUrl(null);
      return;
    }
    supabase.storage
      .from('avatars')
      .createSignedUrl(path, 60 * 60)
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [avatarUrl]);

  return url;
}