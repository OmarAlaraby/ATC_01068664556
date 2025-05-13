const CONFIG = {
    API_BASE_URL: 'http://localhost:8000/api', // when i deploy, i will change this to the production URL
    ENDPOINTS: {
        SIGNUP: '/user/signup/',
        LOGIN: '/user/signin/',
        EVENTS: '/events/'
    },
    TOKEN_NAMES: {
        ACCESS: 'access_token',
        REFRESH: 'refresh_token',
        USER_DATA: 'user_data'
    }
};

Object.freeze(CONFIG);
Object.freeze(CONFIG.ENDPOINTS);
Object.freeze(CONFIG.TOKEN_NAMES);
