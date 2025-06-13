import dotenv from 'dotenv';
dotenv.config();

interface Config {
    pinataJwt: string;
    gatewayUrl: string;
    port: number;
    corsOrigin: string;
    jwtSecret: string; 
    jwtExpiration: number; 
    isProduction: boolean;
}

const config: Config = {
    pinataJwt: process.env.PINATA_JWT || '',
    gatewayUrl: process.env.GATEWAY_URL || '',
    port: parseInt(process.env.PORT || '8787', 10),
    corsOrigin: process.env.CORS_ORIGIN || '*',
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiration: process.env.JWT_EXPIRATION ? parseInt(process.env.JWT_EXPIRATION, 10) : 60, 
    isProduction: false
}

export default config;
