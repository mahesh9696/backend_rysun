import { IsNotEmpty, IsNumber, IsString, MaxLength, IsEmail, IsIn, IsOptional } from "class-validator";
export class CreateUserDto {
    @IsString()
    @MaxLength(30)
    @IsNotEmpty()
    readonly fullName: string;

    @IsEmail()
    @IsNotEmpty()
    readonly emailId: string;

    @IsNumber()
    @IsNotEmpty()
    readonly phoneNumber: number;

    @IsString()
    @IsNotEmpty()
    password: number;

    isActive: boolean

    @IsString()
    @IsIn(['admin', 'user'])
    @IsNotEmpty()
    readonly userType: string;
}


export class GetUsersDto {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsString()
    page?: number;

    @IsOptional()
    @IsString()
    limit?: number;
}