import { isValid, parseISO } from 'date-fns';

export const validateDate = (dateString: string | undefined): boolean => {
  if (!dateString) return true; // Optional field

  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
};

export const formatDateForStorage = (date: Date | null): string | undefined => {
  return date ? date.toISOString() : undefined;
};

export const parseDateFromStorage = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;

  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};
