/**
 * Format currency amount to Vietnamese Dong (VND)
 */
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format currency amount to Vietnamese Dong without symbol
 */
export const formatVNDWithoutSymbol = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

