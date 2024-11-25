import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt-payload.interface';  // Define this interface for JWT payload

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extract JWT from Authorization header
            ignoreExpiration: false,
            secretOrKey: 'mykey',  // Secret for verifying JWT (environment variable)
        });
    }

    async validate(payload: JwtPayload) {
        // You can add additional validation logic here
        // Typically, you can fetch the user from the database using the payload data
        return { email: payload.email, password: payload.password };
    }
}
