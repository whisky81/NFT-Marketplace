import type { Trait } from "../hooks/useCreate";

export interface MetadataStorage {
    name: string;
    description: string;
    external_url: string;
    attributes: Trait[];
    file: string;
    isImage: boolean;
}

export interface NFT extends MetadataStorage {
    tokenId: string;
    price: string;
    status: boolean;
}

