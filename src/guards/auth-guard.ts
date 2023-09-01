import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly service: UsersService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const {authorization} = request.headers;

        try {
            const data = this.service.checkToken((authorization?? "").split(" ")[1]);
            const user = await this.service.findOne(parseInt(data.sub));
            request.user = user;
        } catch (error) {
            console.log(error);
            return false;
        }

        return true;
    }
}