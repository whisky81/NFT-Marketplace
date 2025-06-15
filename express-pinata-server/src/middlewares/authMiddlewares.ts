import { NextFunction, Request, Response } from "express";
import JWT, { Payload } from "../utils/jwt"; 
const allowed = {
    GET: new Set(['/nonce']),
    POST: new Set(['/sign-in-with-ethereum']),
    DELETE: new Set()
}; 

export interface CustomRequest extends Request { 
    payload: Payload 
};

type AllowedMethod = keyof typeof allowed; 

function isAlowedMethod(method: string): method is AllowedMethod {
    return method in allowed;
}

async function authMiddleware(
    req: CustomRequest, 
    res: Response, 
    next: NextFunction) {  

    if (isAlowedMethod(req.method) && allowed[req.method].has(req.path)) {
        return next();
    }

    try {
        const token = req.cookies.accessToken as string || undefined;
        if (!token) {
            throw new Error("Access token is missing");
        } 
        const decoded = await JWT.decodeJwtToken(token) as Payload || undefined;
        if (!decoded || !decoded.message || !decoded.signature || !decoded.nonce) {
            throw new Error("Invalid access token");
        }
        
        req.payload = decoded;
        return next();
    } catch (error: any) {
        console.error(error);
        res.status(400).json({
            message: error?.message || "An error occurred",
        });
        return;
    }
}

export default authMiddleware;
