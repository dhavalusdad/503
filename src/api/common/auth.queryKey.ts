export const authQueryKey = {
  getUserKey: (params?: object) => ['auth', 'currentUser', params].filter(d => d !== undefined),
  userProfile: (params?: object) => ['auth', 'user', params].filter(d => d !== undefined),
  login: (params?: object) => ['login', params].filter(d => d !== undefined),
  googleLogin: (params?: object) => ['googleLogin', params].filter(d => d !== undefined),
  googleRegister: (params?: object) => ['googleRegister', params].filter(d => d !== undefined),
};
