import jwt from 'jsonwebtoken';
export const JWT_TOKEN = process.env.JWT_SECRET || 'fallback-secret-key';
export const generateToken = (clientId) => {
    return jwt.sign({ id: clientId }, JWT_TOKEN, { expiresIn: '1h' });
};
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_TOKEN);
        return decoded;
    }
    catch (err) {
        console.log('error verifying token:', err);
        throw new Error('Token verification failed');
    }
};
