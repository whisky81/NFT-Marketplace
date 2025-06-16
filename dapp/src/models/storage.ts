
export interface Trait {
    trait_type: string;
    value: string;
}

export interface FormData {
    name: string;
    description: string;
    external_url: string;
    attributes: Trait[];
}

export interface Metadata extends FormData {
    file: string,
    isImage: boolean
}

export interface NFT extends Metadata {
    tokenId: string;
    price: string;
    status: boolean;
    owner: string;
}

