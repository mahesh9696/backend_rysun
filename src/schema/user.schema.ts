import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { UserType } from "src/interface/user.interface";
import * as bcrypt from 'bcrypt';
export type UserDocument = User & Document;
export interface User extends Document {
    _id: string;  // This will allow TypeScript to understand that _id exists
    email: string;
    password: string;
    isActive: boolean;
    // Add other fields as necessary
}

@Schema({ timestamps: true })
export class User {
    @Prop()
    fullName: string;
    @Prop()
    emailId: string;
    @Prop()
    phoneNumber: number;
    @Prop()
    password: string;
    @Prop({ type: Boolean, default: true })
    isActive: boolean;
    @Prop({
        type: String,
        enum: [UserType.Admin, UserType.User], // Validates userType field against the enum
        required: true,
        default: UserType.User
    })
    userType: string;

    // Pre-save hook to hash the password
    // async hashPassword(): Promise<void> {
    //     // if (this.isModified('password')) {
    //     //     const salt = await bcrypt.genSalt(10);
    //     //     this.password = await bcrypt.hash(this.password, salt);
    //     // }
    // }
}
export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.pre('save', async function () {
//     await this.hashPassword();
// });