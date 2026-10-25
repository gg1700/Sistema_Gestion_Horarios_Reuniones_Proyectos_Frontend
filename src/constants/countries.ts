import type { Country } from '../types/profile';

export const countries: Country[] = [
  { name: 'Bolivia', code: '591', phoneDigits: { minimum: 8, maximum: 8 } },
  { name: 'Argentina', code: '54', phoneDigits: { minimum: 10, maximum: 11 } },
  { name: 'Brasil', code: '55', phoneDigits: { minimum: 10, maximum: 11 } },
  { name: 'Chile', code: '56', phoneDigits: { minimum: 9, maximum: 9 } },
  { name: 'Colombia', code: '57', phoneDigits: { minimum: 10, maximum: 10 } },
  { name: 'Ecuador', code: '593', phoneDigits: { minimum: 8, maximum: 9 } },
  { name: 'Paraguay', code: '595', phoneDigits: { minimum: 7, maximum: 9 } },
  { name: 'Perú', code: '51', phoneDigits: { minimum: 8, maximum: 9 } },
  { name: 'Uruguay', code: '598', phoneDigits: { minimum: 8, maximum: 8 } },
  { name: 'Venezuela', code: '58', phoneDigits: { minimum: 10, maximum: 10 } },
  { name: 'México', code: '52', phoneDigits: { minimum: 10, maximum: 10 } },
  { name: 'España', code: '34', phoneDigits: { minimum: 9, maximum: 9 } },
  { name: 'Estados Unidos', code: '1', phoneDigits: { minimum: 10, maximum: 10 } },
];

export function findCountryByCode(code: string) {
  return countries.find((country) => country.code === code);
}

export function describePhoneDigits(country: Country) {
  const { minimum, maximum } = country.phoneDigits;
  return minimum === maximum ? `${minimum} dígitos` : `${minimum} a ${maximum} dígitos`;
}
