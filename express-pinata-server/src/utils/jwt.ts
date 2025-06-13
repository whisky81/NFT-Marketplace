import config from "../config/config";
import jwt from "jsonwebtoken";

export interface Payload {
    message: string;
    signature: string;
    nonce: string;
}

class JWT {
    static generateJwtToken(payload: Payload): string {
        return jwt.sign(payload, config.jwtSecret, {
            expiresIn: config.jwtExpiration
        });
    }

    static decodeJwtToken(token: string): Promise<Payload> {
        return new Promise((resolve, reject): void => {
            jwt.verify(token, config.jwtSecret, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded as Payload);
                }
            });
        });
    }
}

export default JWT;