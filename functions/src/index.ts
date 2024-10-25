
import {admin} from "./FirebaseConfig";
import {createUser,clickVerifyAccount,requestVerifyAccount,requestResetPassword} from "./api/AuthAPI";
import {createUserEvent} from "./event/AuthEvent";
import {createCategory,getCategories} from "./api/CategoryAPI";
import {createExpense, getExpenses} from "./api/ExpenseAPI";
import {onUpdateCategory} from "./event/CategoryEvent";
import {scheduleSendNotification} from "./crons/ScheduleSendNotification";
admin.initializeApp();


//auth
export const createUserApi = createUser;
export const clickVerifyAccountApi = clickVerifyAccount;
export const requestVerifyAccountApi = requestVerifyAccount;
export const requestResetPasswordApi = requestResetPassword;

//collection user event
export const createUserEventFunction = createUserEvent;


//category
export const createCategoryApi = createCategory;
export const getCategoriesApi = getCategories;
export const onUpdateCategoryFunction = onUpdateCategory;


//expense
export const createExpenseApi = createExpense;
export const getExpensesApi = getExpenses;

//crons
export const scheduleSendNotificationFunction = scheduleSendNotification;