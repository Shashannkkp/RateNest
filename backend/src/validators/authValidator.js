
const validateNewPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    return (
        typeof password === 'string' &&
        passwordRegex.test(password)
    );
};

const validateRegistration = ({ name, email, address, password }) => {
    const errors = [];

    if (
        typeof name !== 'string' ||
        name.trim().length < 20 ||
        name.trim().length > 60
    ) {
        errors.push('Name must be between 20 and 60 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        typeof email !== 'string' ||
        !emailRegex.test(email.trim())
    ) {
        errors.push('Please enter a valid email address.');
    }

    if (
        typeof address !== 'string' ||
        address.trim().length === 0 ||
        address.trim().length > 400
    ) {
        errors.push('Address is required and must not exceed 400 characters.');
    }

    if (!validateNewPassword(password)) {
        errors.push(
            'Password must be 8-16 characters and contain at least one uppercase letter and one special character.'
        );
    }

    return errors;
};

module.exports = {
    validateRegistration,
    validateNewPassword,
};