
import {admin} from "./FirebaseConfig";
import {createUser,clickVerifyAccount} from "./api/AuthAPI";
import {createUserEvent} from "./event/AuthEvent";
admin.initializeApp();

export const createUserApi = createUser;
export const clickVerifyAccountApi = clickVerifyAccount;
export const createUserEventFunction = createUserEvent;

