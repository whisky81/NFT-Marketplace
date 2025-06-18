import type { PinataSDK } from "pinata";
import Account from "./account";
import { generateNonce, SiweMessage } from 'siwe';
import type { Whisky } from "../abis/Whisky";
import type { NFT, FormData, Metadata } from "./storage";
import { formatEther } from "ethers";

const MAX_SIZE = 20 * 1024 * 1024;


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

    static getNFT(nft: Whisky.AssetStructOutput, contract: Whisky): Promise<NFT> {
        return new Promise(async (resolve, reject) => {
            try {
                const uri = Utils.getIpfsUri(nft.cid);
                const response = await fetch(uri);
                const metadata = (await response.json()) as Metadata;
                metadata.file = Utils.getIpfsUri(metadata.file);

                let owner = await contract.ownerOf(nft.tokenId);
                // const currentAddress = await (contract.runner as ethers.Signer).getAddress();
                // owner = owner === account.address ? "You" : Account.getShortenAddress(owner);

                const _nft: NFT = {
                    ...metadata,
                    tokenId: nft.tokenId.toString(),
                    price: formatEther(nft.price),
                    status: nft.status === 0n,
                    owner
                };
                resolve(_nft)
            } catch (e) {
                reject(e);
            }
        });
    }

    static async searchByAll(contract: Whisky, value: string): Promise<Whisky.AssetStructOutput[]> {
        try {
            const _nfts = await contract.getAvailableTokens();
            const nftsByOwner = await contract.getTokensOf(value);

            return _nfts.filter(nft => {
                return (
                    nft.tokenId.toString() === value ||
                    nft.name.toLowerCase().includes(value.toLowerCase()) ||
                    nftsByOwner.some(e => e.tokenId.toString() === nft.tokenId.toString())
                );
            });
        } catch (e) {
            throw e;
        }
    }


    static async search(contract: Whisky, filter: string, value: string): Promise<Whisky.AssetStructOutput[]> {
        let res: Whisky.AssetStructOutput[] = [];
        try {
            if (filter === 'all' && value === '') {
                return (await contract.getAvailableTokens());
            }
            if (filter === 'tokenId') {
                res.push(await contract.getTokenById(BigInt(value)));
            } else if (filter === 'owner') {
                res = await contract.getTokensOf(value);
            } else if (filter === 'name') {
                const _nfts = await contract.getAvailableTokens();
                res = _nfts.filter(nft => nft.name.toLowerCase().includes(value.toLowerCase()));
            } else {
                res = await Utils.searchByAll(contract, value);
            }
        } catch (e) {

        }

        return res;
    }

    static async isApprovedFor(tokenId: bigint, contract: Whisky, account: Account): Promise<boolean> {
        try {
            const owner = await contract.ownerOf(tokenId);
            const isApprovedForAll = await contract.isApprovedForAll(owner, account.address);
            const approvedAddress = await contract.getApproved(tokenId);
            return (
                owner === account.address ||
                isApprovedForAll ||
                approvedAddress === account.address
            );
        } catch(e) {
            throw e;
        }
    }
}

export default Utils;