import type { PinataSDK } from "pinata";
import type Account from "./account";
import { generateNonce, SiweMessage } from 'siwe';
import type { FormData } from "../hooks/useCreate";
import type { Whisky } from "../abis/Whisky";
import type { NFT, MetadataStorage } from "./storage";
import { formatEther } from "ethers";

const MAX_SIZE = 20 * 1024 * 1024;

interface Metadata extends FormData {
    file: string,
    isImage: boolean
}

class Utils {
    static signInWithEthereum(
        account: Account,
        window: Window
    ): Promise<void> {
        const url = import.meta.env.VITE_SERVER_URL as string;
        return new Promise(async (resolve, reject) => {
            try {
                const scheme = window.location.protocol.slice(0, -1);
                const domain = window.location.host;
                const origin = window.location.origin;
                const nonce = generateNonce();

                let siweObj = new SiweMessage({
                    scheme,
                    domain,
                    address: account.address,
                    statement: "verity your account to start mint nft",
                    uri: origin,
                    version: "1",
                    chainId: 1,
                    nonce,
                });
                const message = siweObj.prepareMessage();

                const signature = await account.signer.signMessage(message);

                await fetch(`${url}/sign-in-with-ethereum`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message, signature, nonce }),
                    credentials: 'include'
                });

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }


    static getPresignedUrl(url: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${url}/presigned-url`, {
                    credentials: 'include'
                });
                const data = await response.json() as { url: string };
                resolve(data.url);
            } catch (e) {
                reject(e);
            }
        })
    }

    static uploadToIPFS(
        pinata: PinataSDK,
        file: File,
        data: FormData
    ): Promise<string[]> {
        const url = import.meta.env.VITE_SERVER_URL as string;
        return new Promise(async (resolve, reject) => {
            try {
                if (!file || file.size > MAX_SIZE) {
                    throw new Error(
                        "File size exceeds the 20 MB limit. Please select a smaller file. or file doesnt exist"
                    );
                }
                if (!data) {
                    throw new Error("Metadata (data) must be provided.");
                }
                if (!data.hasOwnProperty("name")) {
                    throw new Error("Metadata must include a 'name' property.");
                }

                let presignedUrl = await Utils.getPresignedUrl(url);

                const uploadFile = await pinata.upload.public
                    .file(file)
                    .url(presignedUrl);
                if (!uploadFile.cid) {
                    throw new Error("Upload Image Failed");
                }

                const metadata: Metadata = {
                    ...data,
                    file: uploadFile.cid,
                    isImage: file.type.includes('image/')
                };
                const jsonBlob = new Blob([JSON.stringify(metadata)], {
                    type: "application/json",
                });
                const metadataFile = new File([jsonBlob], "metadata.json", {
                    type: "application/json",
                });

                presignedUrl = await Utils.getPresignedUrl(url);
                const uploadMetadata = await pinata.upload.public
                    .file(metadataFile)
                    .url(presignedUrl);

                if (!uploadMetadata.cid) {
                    throw new Error("Upload Metadata Failed");
                }

                resolve([uploadMetadata.cid, uploadFile.cid]);
            } catch (e) {
                reject(e);
            }
        })
    }

    static getIpfsUri(cid: string): string {
        const url = import.meta.env.VITE_GATEWAY_URL;
        return `${url}/ipfs/${cid}`;
    }

    static toCidMap(nfts: Whisky.AssetStructOutput[]): Map<bigint, Whisky.AssetStructOutput> {
        const res = new Map<bigint, Whisky.AssetStructOutput>();
        for (const nft of nfts) {
            res.set(nft.tokenId, nft);
        }
        return res;
    }

    static getNFT(nft: Whisky.AssetStructOutput): Promise<NFT> {
        return new Promise(async (resolve, reject) => {
            try {
                const uri = Utils.getIpfsUri(nft.cid);
                const response = await fetch(uri);
                const metadata = (await response.json()) as MetadataStorage;
                metadata.file = Utils.getIpfsUri(metadata.file);

                const _nft: NFT = {
                    ...metadata,
                    tokenId: nft.tokenId.toString(),
                    price: formatEther(nft.price),
                    status: nft.status === 0n
                };
                resolve(_nft)
            } catch (e) {
                reject(e);
            }
        });
    }
}

export default Utils;