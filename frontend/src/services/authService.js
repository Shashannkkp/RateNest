
import api from './api';

const authService = {
  login: (credentials) =>
    api.post('/auth/login', credentials),

  register: (userData) =>
    api.post('/auth/register', userData),

  changePassword: (passwordData) =>
    api.put('/auth/change-password', passwordData),
};

export default authService;
