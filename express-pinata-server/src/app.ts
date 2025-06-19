import express, { Request, Response } from "express";
import cors from "cors";
import { SiweErrorType, SiweMessage } from "siwe";
import cookie from "cookie-parser";
import JWT, { Payload } from "./utils/jwt";
import { PinataSDK } from "pinata";

import config from "./config/config";
import authMiddleware, { CustomRequest } from "./middlewares/authMiddlewares";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
}));
app.use(cookie());
app.use(authMiddleware as express.RequestHandler);

app.post('/sign-in-with-ethereum', (req: Request, res: Response) => {
    const reqBody = req.body;

    if (!reqBody.message || !reqBody.signature || !reqBody.nonce) {
        res.status(400).json({
            message: "Missing required fields: message, signature, or nonce"
        });
        return;
    }

    const token = JWT.generateJwtToken(reqBody as Payload);

    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: config.isProduction,
        maxAge: 60 * 1000, // 1m
        sameSite: "lax",
        path: "/"
    });

    res.json({
        message: "Successfully signed in",
    });
    return;
})

// @ts-ignore
app.get('/presigned-url', async (req: CustomRequest, res: Response): Promise<void> => {
    try {

        const payload = req.payload;

        let siweObj = new SiweMessage(payload.message);

        await siweObj.verify({
            signature: payload.signature,
            nonce: payload.nonce,
        });

        const pinata = new PinataSDK({
            pinataJwt: config.pinataJwt,
            pinataGateway: config.gatewayUrl
        })

        const url = await pinata.upload.public.createSignedURL({
            expires: 60
        });

        res.json({
            url
        });
        return;
    } catch (error: any) {
        console.error(error);
        switch (error) {
            case SiweErrorType.EXPIRED_MESSAGE: {
                res.status(440).json({ message: error.message || "Expired Message" });
                return;
            }
            case SiweErrorType.INVALID_SIGNATURE: {
                res.status(422).json({ message: error.message || "Invalid Signature" });
                return;
            }
            default: {
                res.status(500).json({
                    message: error.message || "An error occurred while generating the presigned URL",
                });
                return;
            }
        }
    }
})

app.post('/unpin', async (req: Request, res: Response): Promise<void> => {
    try {

        const cids: string[] = req.body.cids;
        const pinata = new PinataSDK({
            pinataJwt: config.pinataJwt,
            pinataGateway: config.gatewayUrl,
        });

        await pinata.files.public.delete(cids);

        res.status(200).json({
            message: 'unpin successfully'
        });
        return;
    } catch (e: any) {
        res.status(500).json({
            message: e.message || "Unpin failed"
        });
        return;
    }
})

export default app;