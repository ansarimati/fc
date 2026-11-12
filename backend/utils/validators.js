export const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

export const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

export const validatePincode = (pincode) => /^[1-9][0-9]{5}$/.test(pincode);

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

