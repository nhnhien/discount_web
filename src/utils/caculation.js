const calculateCPPrice = (price, discountValue, discountType) => {
    const discount = Number(discountValue);
  
    if (!discount || discount <= 0) return price;
  
    if (discountType === 'percentage') {
      return Math.max((price * (100 - discount)) / 100, 0);
    } else if (discountType === 'fixed') {
      return Math.max(price - discount, 0);
    }
    return price;
  };
  
  export { calculateCPPrice };