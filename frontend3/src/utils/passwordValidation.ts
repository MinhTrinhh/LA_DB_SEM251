/**
 * Password Validation Utility
 *
 * Requirements:
 * - 8-16 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  // Check length (8-16 characters)
  if (password.length < 8 || password.length > 16) {
    errors.push("Password must be between 8 and 16 characters");
  }

  // Check for at least 1 uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least 1 uppercase letter");
  }

  // Check for at least 1 number
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least 1 number");
  }

  // Check for at least 1 special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least 1 special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const isPasswordValid = (password: string): boolean => {
  return validatePassword(password).isValid;
};

