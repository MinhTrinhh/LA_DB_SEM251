import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Criterion {
  label: string;
  test: (password: string) => boolean;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const criteria: Criterion[] = [
    {
      label: "8-16 characters",
      test: (pwd) => pwd.length >= 8 && pwd.length <= 16,
    },
    {
      label: "At least 1 uppercase letter (A-Z)",
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      label: "At least 1 number (0-9)",
      test: (pwd) => /[0-9]/.test(pwd),
    },
    {
      label: "At least 1 special character (!@#$%^&*()_+-=)",
      test: (pwd) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
    },
  ];

  return (
    <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
      <p className="text-sm font-medium text-muted-foreground mb-2">
        Password Requirements:
      </p>
      {criteria.map((criterion, index) => {
        const isValid = password.length > 0 && criterion.test(password);
        const isInvalid = password.length > 0 && !criterion.test(password);

        return (
          <div
            key={index}
            className={`flex items-center gap-2 text-sm transition-colors ${
              isValid
                ? "text-green-600 dark:text-green-400"
                : isInvalid
                ? "text-red-600 dark:text-red-400"
                : "text-muted-foreground"
            }`}
          >
            {isValid ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : isInvalid ? (
              <X className="w-4 h-4 flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
            )}
            <span className={isValid ? "font-medium" : ""}>
              {criterion.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PasswordStrengthIndicator;

