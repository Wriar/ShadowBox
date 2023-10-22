import crypto from 'crypto';
function combineStrings(passwordA, result) {
    const salt = crypto.randomBytes(16); // Generate a random salt
    const iterations = 10000; // The number of iterations
    const keyLength = 32; // The length of the derived key in bytes
    const derivedKey = crypto.pbkdf2Sync(passwordA, salt, iterations, keyLength, 'sha256');
    const passwordB = derivedKey.toString('hex');
    return {
        passwordB,
        salt: salt.toString('hex'),
    };
}

// Function to reverse the process and generate the result
function reverseCombineStrings(passwordA, passwordB, salt) {
    const iterations = 10000; // The same number of iterations used during combination
    const keyLength = 32; // The same key length used during combination
    const derivedKey = crypto.pbkdf2Sync(passwordA, Buffer.from(salt, 'hex'), iterations, keyLength, 'sha256');
    const calculatedPasswordB = derivedKey.toString('hex');
    return calculatedPasswordB === passwordB;
}