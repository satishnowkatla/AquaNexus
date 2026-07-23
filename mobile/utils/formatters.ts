export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  return d.toLocaleDateString('en-IN', defaultOptions);
};

export const formatWeight = (weight: number, unit: 'kg' | 'g' | 'tons' = 'kg'): string => {
  switch (unit) {
    case 'g':
      return `${weight.toFixed(1)} g`;
    case 'tons':
      return `${weight.toFixed(2)} tons`;
    case 'kg':
    default:
      return `${weight.toFixed(2)} kg`;
  }
};
