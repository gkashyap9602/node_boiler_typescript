import admin from './admin.messages'
import users from './user.messages'
import common from './common.messages'
import middlewareMessages from './common.messages'


export default {
    admin,
    users,
    common,
    middleware: { ...middlewareMessages.middleware },
};
