import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/user/';

class UserService {

  postUserQuery(place) {
    return axios
      .post(API_URL + 'score', place, { headers: authHeader() });
  }

}

export default new UserService();