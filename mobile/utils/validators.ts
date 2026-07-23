export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validatePhone = (phone: string): ValidationResult => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 0) {
    return { isValid: false, message: 'Phone number is required' };
  }
  if (cleaned.length !== 10) {
    return { isValid: false, message: 'Phone number must be 10 digits' };
  }
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: false, message: 'Enter a valid Indian phone number' };
  }
  return { isValid: true, message: '' };
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Enter a valid email address' };
  }
  return { isValid: true, message: '' };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: '' };
};
