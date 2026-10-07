/**
 * Supported Currencies Configuration
 */
export const CURRENCY_CONFIG = {
  INR: { code: 'INR', symbol: '₹', label: '₹ INR — Indian Rupee', locale: 'en-IN', fractionDigits: 2 },
  USD: { code: 'USD', symbol: '$', label: '$ USD — US Dollar', locale: 'en-US', fractionDigits: 2 },
  EUR: { code: 'EUR', symbol: '€', label: '€ EUR — Euro', locale: 'en-IE', fractionDigits: 2 },
  GBP: { code: 'GBP', symbol: '£', label: '£ GBP — British Pound', locale: 'en-GB', fractionDigits: 2 },
  JPY: { code: 'JPY', symbol: '¥', label: '¥ JPY — Japanese Yen', locale: 'ja-JP', fractionDigits: 0 },
};

/**
 * Get the currently active currency code from user preference or storage
 * Default is strictly INR
 */
export const getActiveCurrencyCode = () => {
  try {
    const storedUser = localStorage.getItem('spendwise_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.currency && CURRENCY_CONFIG[parsed.currency]) {
        return parsed.currency;
      }
    }
  } catch {}
  return localStorage.getItem('spendwise_currency') || 'INR';
};

/**
 * Get active currency symbol (e.g. '₹', '$')
 */
export const getActiveCurrencySymbol = (currencyCode) => {
  const code = currencyCode || getActiveCurrencyCode();
  return CURRENCY_CONFIG[code]?.symbol || '₹';
};

/**
 * Centralized currency formatter utilizing Intl.NumberFormat
 * @param {Number} amount
 * @param {String} [overrideCode]
 */
export const formatCurrency = (amount, overrideCode) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    const sym = getActiveCurrencySymbol(overrideCode);
    return `${sym}0.00`;
  }

  const numericVal = Number(amount);
  const code = overrideCode || getActiveCurrencyCode();
  const config = CURRENCY_CONFIG[code] || CURRENCY_CONFIG.INR;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.fractionDigits,
      maximumFractionDigits: config.fractionDigits
    }).format(numericVal);
  } catch {
    const formatted = Math.abs(numericVal).toLocaleString('en-US', {
      minimumFractionDigits: config.fractionDigits,
      maximumFractionDigits: config.fractionDigits
    });
    return `${numericVal < 0 ? '-' : ''}${config.symbol}${formatted}`;
  }
};

/**
 * Compact currency formatter for Chart Axis labels (e.g. ₹50k, $1.2M)
 */
export const formatCompactCurrency = (amount, overrideCode) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  const num = Number(amount);
  const sym = getActiveCurrencySymbol(overrideCode);

  if (Math.abs(num) >= 10000000) {
    return `${sym}${(num / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `${sym}${(num / 100000).toFixed(1)}L`;
  }
  if (Math.abs(num) >= 1000) {
    return `${sym}${(num / 1000).toFixed(0)}k`;
  }
  return `${sym}${num}`;
};

/**
 * Format ISO date string into human readable format
 * @param {String|Date} dateInput
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Capitalize first letter of string
 * @param {String} str
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
