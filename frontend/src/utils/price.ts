export type Currency = 'USD' | 'INR';

export const formatPrice = (
  amount: number, 
  currency: Currency = 'USD', 
  exchangeRate: number = 83.50
) => {
  let finalAmount = amount;
  let symbol = '$';
  let locale = 'en-US';

  if (currency === 'INR') {
    finalAmount = amount * exchangeRate;
    symbol = '₹';
    locale = 'en-IN';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(finalAmount);
};
