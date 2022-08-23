export const exceptionConfig ={
    'ValidationError':{
        status:422,
        name:'ValidationError',
        message:'Please provide valid parameter'
    },
    'UnAuthorizedError':{
        status:401,
        name:'UnAuthorized',
        message:'Sorry, your request could not be processed.'
    },
    'ForbiddenError':{
        status:403,
        name:'Forbidden',
        message:'Access is denied'
    },
    'ObjectNotFoundError':{
        status:404,
        name:'ObjectNotFound',
        message:'Object not Found'
    },
    'InternalError':{
        status:500,
        name:'Internal Server Error',
        message:'Internal Server Error, please contact support'
    },
    'BadRequestError':{
        status:400,
        name:'Bad Request',
        message:'There seems to be some issue, please contact support',
        supportMessage: 'Please contact to support team for more help'
    },
    'DownTimeError':{
        status:503,
        name:'Service Unavailable',
        message:"There seems to be we're down for some time due to maintaince activity going on right now",
        supportMessage: 'Please contact to support team for more help'
    }
};