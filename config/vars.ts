
let env = process.env.NODE_ENV;
if (!env) {
    env = 'development';
}
let config: any;
switch (env) {
    case 'development':
        config = {
            FRONTEND_URL: 'http://localhost:4200/',
            BACKEND_URL: 'http://localhost:5000',
            PORT: 5000,
            MONGO: {
                hostName: 'localhost', // need to be remove
                mongoDBPort: "27017",
                dbName: 'syologic_shop_live', // need to be remove
                option: {
                    connectTimeoutMS: 600000,
                    useNewUrlParser: true,
                    useCreateIndex: true,
                    useUnifiedTopology: true,
                    keepAlive: 300000,
                    noDelay: true,
                    poolSize: 100,
                    socketTimeoutMS: 300000
                },
                debug: true
            },
            BASE_API_PATH: '/api/',
            BASE_FOLDER_PATH: __dirname.split('/config')[0],
            VENDOR_USERS_FOLDER: 'vendor_users_files',
            LOGGER: {
                appenders: {
                    console: { type: 'console' },
                    app: {
                        "type": "file",
                        "filename": "logs/app.log",
                        "maxLogSize": 26214400, //value in bytes- 25 MB
                        "numBackups": 10
                    },
                    errorFile: {
                        "type": "file",
                        "filename": "logs/errors.log",
                        "maxLogSize": 26214400, //value in bytes- 25 MB
                        "numBackups": 10
                    },
                    errors: {
                        "type": "logLevelFilter",
                        "level": "ERROR",
                        "appender": "errorFile"
                    }
                },
                categories: {
                    default: { appenders: ["app", "errors", "console"], level: 'DEBUG' }
                },
                pm2: true
            },
            ENABLE_CORS: false,
            CORE_ORIGIN_DOMAIN: [],
            DEFAULT_COMPANY_ID: 1,
            COMPANY_LOGIN_PASSWORD: "e10adc3949ba59abbe56e057f20f883e",
            DEFAULT_CREATED_BY: 1,
            TRIAL_DAYS: 30,
            ENABLE_RECAPTCHA: false,
            EMAIL_SERVICE: false,
            DOWN_TIME: new Date('2022-07-08T13:20:30.000Z'), // Mentioned time in ISO format
            MAINTENANCE_MODE: true,
            MAILER: {
                viewspath: '/templatePages/',
                from: 'Syologic Survey Support support@syologicsurvey.com',
                host: "smtpout.secureserver.net",
                secureConnection: true,
                port: 587,
                auth: {
                    user: 'support@syologicsurvey.com',
                    pass: 'DngWTkpRgKMdASy'
                }
            }
        };
        break;
}

config.env = env;
config['RESET_PASSWORD_URL'] = config.FRONTEND_URL + 'auth/change-password';
config['INVOICE_SIGN'] = config.FRONTEND_URL.split('#')[0] + 'assets/images/invoiceSign.png';
config['LOGO'] = config.FRONTEND_URL.split('#')[0] + 'assets/images/logo.jpg';
config['SUPPORT_EMAIL'] = 'support@syologicsurvey.com';
config['UNDER_MAINTENANCE_MESSAGE'] = "We are down for maintenance. Sorry for the inconvenience. We'll be back shortly.";
config['FROM_DOWN_TIME'] = new Date('2021-12-21 14:00:00').getTime(); //set date in ETC time, ISO Date yyyy-mm-dd hh:mm:ss format 
config['TO_DOWN_TIME'] = new Date('2021-12-21 20:00:00').getTime(); //set date in ETC time, ISO Date yyyy-mm-dd hh:mm:ss format 
config['CORE_ORIGIN_DOMAIN'].push(config.FRONTEND_URL.split('/#')[0], config['BACKEND_URL']);
config['COMPANY_EMAIL_LOGO'] = { filename: 'logo.jpg', path: __dirname.replace('/config', '') + '/templatePages/emails/logo.jpg', cid: 'logo@syologicsurvey.com' };
config['CORS_OPTIONS'] = Object.assign({
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Accept-Language',
        'Content-Language',
        'Downlink',
        // 'Viewport-Width', 'Width', 'DPR', 'Save-Data'
    ],
    credentials: true,
    preflightContinue: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE'
}, { 'origin': config['CORE_ORIGIN_DOMAIN'] });
delete config.CORE_ORIGIN_DOMAIN;
/*Status type for all modules*/
config['STATUS'] = {
    'Active': 1,
    'Inactive': 2,
    'Deleted': 3
};

config['ACTION'] = {
    'insert': 'INSERT',
    'update': 'UPDATE',
    'delete': 'DELETE'
};

config['PAGE_SIZE'] = 25;
config.jwtSecretKey = "607d0cb6c3acc11596b81dfd";
config.jwtExpireTime = 1 * 24 * 60 * 60;  // for 1 day
config.resetPwdExpireTime = 10 * 60;  // for 10 min


config['DEFAULT_CLEAN_KEYS'] = ['_id', 'id', 'createdOn', 'modifiedOn', '__v', 'companyId', 'createdBy'];


config['DATE_FORMATS'] = ["MM-DD-YYYY", "DD-MM-YYYY", "YYYY-MM-DD"];
config['RECAPTCHA_SITE_KEY'] = '6Lc5S7cdAAAAAOTqmHyMQI2wm-iymH9entFi-6Hw';
config['RECAPTCHA_SECRET_KEY'] = "6Lc5S7cdAAAAAKEjvG5HfRy7Jj8ZqEIvbcujTP8a";
config['RECAPTCHA_VERIFY_LINK'] = 'https://www.google.com/recaptcha/api/siteverify';
config['PRODUCT_UNIQUE_URL'] = config.FRONTEND_URL + 'view-product/';
config['DEFAULT_FOLDERS'] = {
    'vendorsProof': 'vendorsProof',
    'vendorsProducts': 'vendorsProducts',
    'users': 'users'
};
export const CONFIG = config;
