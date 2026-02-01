import { useQuery } from '@tanstack/react-query';
import { resolvePaymentProfile } from '@/services/ens/resolvePaymentProfile';
import { useDebounce } from './useDebounce';

export function useEnsPaymentProfile(ensName: string) {
  const debouncedName = useDebounce(ensName, 300);
  const isValidName = debouncedName.endsWith('.eth') && debouncedName.length > 4;

  return useQuery({
    queryKey: ['ensPaymentProfile', debouncedName],
    queryFn: () => resolvePaymentProfile(debouncedName),
    enabled: isValidName,
    staleTime: 60_000,
    retry: false,
  });
}
