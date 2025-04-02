const calculateCPPrice = (price, discountValue, discountType) => {
  const original = Number(price);
  const discount = Number(discountValue);

  if (!original || isNaN(original)) return 0;
  if (!discount || discount <= 0) return original;

  if (discountType === 'percentage') {
    return Math.max((original * (100 - discount)) / 100, 0);
  } else if (discountType === 'fixed price') {
    return Math.max(original - discount, 0);
  }

  return original;
};

export { calculateCPPrice };