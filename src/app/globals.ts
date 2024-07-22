// global variables to store the authentication status of the whatsapp web client which is used to check if the user is logged in or not
// and another variable to store the online status of the whatsapp web client
declare global {
    var isLogged: boolean;
    var isOnline: boolean;
}

export {}; // to avoid the error "Cannot redeclare block-scoped variable 'isLogged'." and "Cannot redeclare block-scoped variable 'isOnline'."
