export const validatePhoneNumber = (phone: string): boolean => {
  const value = phone.replace(/\D/g, "");
  return /^(08|62)\d{8,13}$/.test(value);
};
