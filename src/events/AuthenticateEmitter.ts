import EventEmitter from "events";

class AuthenticateEmitter extends EventEmitter {}

const authenticateEmitter = new AuthenticateEmitter();

export default authenticateEmitter;
