const formatVND = (amount) => {
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatUSD = (amount) => {
  if (amount == null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export { formatUSD, formatVND };
