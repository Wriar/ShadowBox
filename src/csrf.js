import crypto from 'crypto';

function generateCSRFToken() {
    return crypto.randomBytes(16).toString('hex');
}

export { generateCSRFToken}