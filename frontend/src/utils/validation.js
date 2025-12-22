export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/, // Indian mobile numbers start with 6-9 usually, and are 10 digits
  PINCODE: /^\d{6}$/,
  NAME: /^[a-zA-Z\s]{2,50}$/, // Only letters and spaces, min 2
  PASSWORD: /^.{6,}$/ // Min 6 chars
};

export const validate = {
  email: (email) => {
    if (!email) return "Email is required";
    if (!PATTERNS.EMAIL.test(email)) return "Invalid email address";
    return null;
  },
  
  phone: (phone) => {
    if (!phone) return "Phone number is required";
    // Allow spaces/dashes/plus in input, but validate sanitized
    const clean = phone.replace(/[\s\-\+]/g, '');
    if (!/^\d+$/.test(clean)) return "Phone number must contain only digits";
    if (clean.length < 10 || clean.length > 13) return "Phone number must be 10-13 digits";
    // if (!PATTERNS.PHONE.test(clean)) return "Invalid Indian mobile number";
    return null;
  },

  password: (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  },

  name: (name) => {
    if (!name) return "Name is required";
    if (!PATTERNS.NAME.test(name.trim())) return "Name should contain only alphabets";
    return null;
  },

  pincode: (pin) => {
    if (!pin) return "Pincode is required";
    if (!PATTERNS.PINCODE.test(pin)) return "Pincode must be 6 digits";
    return null;
  },

  required: (value, fieldName = "Field") => {
    if (!value || value.toString().trim() === "") return `${fieldName} is required`;
    return null;
  }
};

// Helper to validate a full object based on a schema
// schema = { fieldName: validationFn }
export const validateForm = (data, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const error = schema[field](data[field]);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};
