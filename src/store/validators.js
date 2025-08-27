export const isEmailValid = (email) => /\S+@\S+\.\S+/.test(email);

export const isPhoneValid = (phone) => /^[0-9]{10}$/.test(phone);

export const isRequired = (value) => value !== null && value !== undefined && value !== '';
