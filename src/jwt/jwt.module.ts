import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guard/jwt-auth.guard'; // Adjust the path as necessary
import { TokenBlacklistService } from '@src/jwt/tokenBlacklist.service'; // Adjust the path as necessary

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '60m' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [JwtAuthGuard, TokenBlacklistService],
    exports: [JwtAuthGuard, JwtModule, TokenBlacklistService], // Export JwtAuthGuard and JwtModule for use in other modules
})
export class JwtAuthModule { }
