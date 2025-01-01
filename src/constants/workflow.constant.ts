import { EmailSendType, RoleType } from "../utils/interfaces.util";


const ROLE: RoleType = {
    ADMIN: 1,
    SUB_ADMIN: 2,
    USER: 3,
};

const USER_STATUS = {
    ACTIVE: 1,
    DELETED: 2,
    DEACTIVATED: 3,
};


const DEACTIVATE_BY = {
    USER: 'user',
    ADMIN: 'admin',
};

const EMAIL_SEND_TYPE = EmailSendType

export {
    ROLE,
    USER_STATUS,
    DEACTIVATE_BY,
    EMAIL_SEND_TYPE,
};

