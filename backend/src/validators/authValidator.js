
// Validate user registration details
const validateRegistration = ({ name, email, address, password }) => {
    const errors = [];

    // Name: 20-60 characters
    if (
        !name ||
        typeof name !== 'string' ||
        name.trim().length < 20 ||
        name.trim().length > 60
    ) {
        errors.push('Name must be between 20 and 60 characters.');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !email ||
        typeof email !== 'string' ||
        !emailRegex.test(email.trim())
    ) {
        errors.push('Please enter a valid email address.');
    }

    // Address: required, maximum 400 characters
    if (
        !address ||
        typeof address !== 'string' ||
        address.trim().length === 0 ||
        address.trim().length > 400
    ) {
        errors.push('Address is required and must not exceed 400 characters.');
    }

    // Password: 8-16 characters, uppercase and special character
    if (!validateNewPassword(password)) {
        errors.push(
            'Password must be 8-16 characters and contain at least one uppercase letter and one special character.'
        );
    }

    return errors;
};

// Validate new password
const validateNewPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    return (
        typeof password === 'string' &&
        passwordRegex.test(password)
    );
};

module.exports = {
    validateRegistration,
    validateNewPassword,
};
