import { faenas } from '@/data/mockData';

export function getFaenaShortName(faenaId?: string | null): string | null {
  if (!faenaId) return null;
  const faena = faenas.find(f => f.id === faenaId);
  if (!faena) return null;
  return faena.nombre.split(' - ')[0];
}

export function findFaenaIdByText(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  const found = faenas.find(f => {
    const shortName = f.nombre.split(' - ')[0].toLowerCase();
    const zoneName = shortName.replace('faena ', '');
    return normalized.includes(shortName) ||
      f.nombre.toLowerCase().includes(normalized) ||
      normalized.includes(zoneName);
  });
  return found?.id ?? null;
}

export function matchesFaena(recordFaena?: string | null, faenaId?: string | null): boolean {
  const shortName = getFaenaShortName(faenaId);
  if (!shortName || !recordFaena) return true;
  const record = recordFaena.toLowerCase();
  const short = shortName.toLowerCase();
  return record.includes(short) || short.includes(record);
}

export function matchesBodegaFaena(bodega?: string | null, faenaId?: string | null): boolean {
  const shortName = getFaenaShortName(faenaId);
  if (!shortName || !bodega) return true;

  const normalizedBodega = bodega.toLowerCase();
  const zona = shortName.replace('Faena ', '').toLowerCase();

  return normalizedBodega.includes(zona);
}

export function buildSearch(pathname: string, params: Record<string, string | null | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
