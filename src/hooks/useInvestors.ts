import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CapitalPartnerService } from '@/services/api/capitalPartnerService';
import type { CapitalPartnerUIData } from '@/services/api/capitalPartnerService';

export function useInvestors(page = 0, size = 20) {
  return useQuery<CapitalPartnerUIData[], Error>({
    queryKey: ['investors', page, size],
    queryFn: useCallback(() => CapitalPartnerService.getCapitalPartners(page, size), [page, size]),
    keepPreviousData: true,
  });
}
