import { supabase } from './supabase';

export function cn(...inputs: (string | boolean | null | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date, locale: string = 'de-AT'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatTime(date: string | Date, locale: string = 'de-AT'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export function formatDateTime(date: string | Date, locale: string = 'de-AT'): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency,
  }).format(price);
}

export function calculateDays(startDate: Date, endDate: Date): number {
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function generateGuestToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone.replace(/[\s-()]/g, ''));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function isWithinBusinessHours(
  date: Date,
  openingHours: Record<string, { open: string; close: string; closed: boolean }>
): boolean {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[date.getDay()];
  const hours = openingHours[dayName];

  if (!hours || hours.closed) return false;

  const [openHour, openMin] = hours.open.split(':').map(Number);
  const [closeHour, closeMin] = hours.close.split(':').map(Number);

  const timeInMinutes = date.getHours() * 60 + date.getMinutes();
  const openInMinutes = openHour * 60 + openMin;
  const closeInMinutes = closeHour * 60 + closeMin;

  return timeInMinutes >= openInMinutes && timeInMinutes <= closeInMinutes;
}

export function getLocaleFromLanguage(lang: string): string {
  const localeMap: Record<string, string> = {
    de: 'de-AT',
    en: 'en-GB',
    fr: 'fr-FR',
    it: 'it-IT',
    es: 'es-ES',
  };
  return localeMap[lang] || 'de-AT';
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return false;
    return data.role === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin role:', error);
    return false;
  }
}
