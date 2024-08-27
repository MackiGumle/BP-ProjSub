import axios from 'axios';
import { api } from '../appsettings';
import { UserToken } from '@/models/User';

export const LoginCall = async (email: string, password: string) => {
    try {
        const response = await axios.post<UserToken>(`${api}/auth/login`, {
            email: email,
            password: password
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const RegisterCall = async (email: string, name: string, surname: string, password: string) => {
    try {
        const response = await axios.post<UserToken>(`${api}/auth/register`, {
            email: email,
            name: name,
            surname: surname,
            password: password
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}