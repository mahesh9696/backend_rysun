import { Document } from 'mongoose';

export enum UserType {
    Admin = 'admin',
    User = 'user',
}
export interface IUser extends Document {
    readonly fullName: string;
    readonly emailId: string;
    readonly phoneNumber: number;
    readonly password: string;
    readonly isActive: boolean;
    readonly userType: UserType
}