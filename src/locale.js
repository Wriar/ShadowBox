
const loginMessages = {
    SERVER_LOGIN_FAIL: "Could not log in at this time. Please try again later.",
    INVALID_REQUEST_STATE: "Invalid request. Please refresh the page.",
    BAD_METHOD: "Invalid method",

    
    PASSWORD_INVALID: "Invalid Password. Please try again.",
    USERNAME_INVALID: "Invalid Username. Please try again.",

    ACCOUNT_MASTER_INVALID: "Could not log in at this time. Please try again later.",

    OK: "Logged in, redirecting..."
}

const stateMessages = {
    CSRF_TOKEN_INVALID: "Could not authenticate your request. Please log out and log in again (C1).",
    NOT_LOGGED_IN: "You are not logged in.",
}

const statusMessages = {
    OK: "OK",
    FOLDER_STRUCTURE_FETCH_FAIL: "Could not get folder structure. Please try again.",
}

const displayText = {
    COPYRIGHT: "&copy; ShadowBox 2023. For Internal Use Only",
}

export {loginMessages, stateMessages, statusMessages, displayText};