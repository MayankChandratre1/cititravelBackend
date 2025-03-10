
import bcrypt from 'bcrypt';

export const hash = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}

export const compare = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}