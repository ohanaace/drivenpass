import { JwtService } from "@nestjs/jwt";

export class TokenFactory {
    private userId: number;
    private email: string;
    private EXPIRATION_TIME = '7 days';
    private ISSUER = 'Driven-pass';
    private AUDIENCE = 'users';

    constructor(private readonly jwtService: JwtService) { }

    withEmail(email: string) {
        this.email = email;
        return this;
    }

    withUserId(userId: number) {
        this.userId = userId;
        return this;
    }

    build(){
        return {
            userId: this.userId,
            email: this.email
        };
    };

    generate() {
        const user = this.build();
        const {email, userId} = user;
        return this.jwtService.sign({email}, {
            expiresIn: this.EXPIRATION_TIME,
            issuer: this.ISSUER,
            audience: this.AUDIENCE,
            subject: String(userId)
        })
    }
};