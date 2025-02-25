import axios from 'axios';

const API_URL = '/api/auth/';

class AuthService {
  login(user) {
    return axios
      .post(API_URL + 'signin', {
        username: user.username,
        password: user.password
      })
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(user) {
    return axios.post(API_URL + 'signup', {
      nome: user.nome,
      cognome: user.cognome,
      saldo: user.saldo,
      username: user.username,
      email: user.email,
      password: user.password
    });
  }
}

export default new AuthService();
