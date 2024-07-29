import EventEmitter from "events";
/**
 * @fires AuthenticateEmitter#change_qr
 * @fires AuthenticateEmitter#change_online
 * @fires AuthenticateEmitter#change_logged
 */
class AuthenticateEmitter extends EventEmitter {}

const authenticateEmitter = new AuthenticateEmitter();

export default authenticateEmitter;
