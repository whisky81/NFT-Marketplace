import { useEffect, useState } from "react";
import useW3Context from "./useW3Context";
import { useNavigate } from "react-router-dom";
import type { NFT } from "../models/storage";
import Utils from "../models/utils";


export default function useTransfer(tokenId: string | undefined, _metadata: NFT | null) {
    const navigate = useNavigate();
    const w3Context = useW3Context();
    const { account, contract } = w3Context;

    const [targetAddress, setTargetAddress] = useState('');
    const [error, setError] = useState('');
    const [metadata, setMetadata] = useState<NFT | null>(null);

    const handleTransfer = async () => {
        try {
            if (!tokenId) {
                throw new Error("Invalid Token ID");
            }
            if (!account || !contract) {
                throw new Error("There is an error in the account or the contract");
            }

            await contract["safeTransferFrom(address,address,uint256)"](account.address, targetAddress, BigInt(tokenId));
            // await contract.transferFrom(account.address, targetAddress, BigInt(tokenId));
            navigate(`/profile/${account.address}`);
        } catch (e: any) {
            setError(e.message || "Failed to transfer");
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
                if (!tokenId) {
                    throw new Error("Invalid Token ID");
                }
                if (!account || !contract) {
                    throw new Error("Wating for initialization");
                }

                const _tokenId = BigInt(tokenId);
                const success = await Utils.isApprovedFor(_tokenId, contract, account);
                if (!success) {
                    throw new Error("Forbidden");
                }
                if (!_metadata) {
                    const nft = await contract.getTokenById(_tokenId);

                    setMetadata(await Utils.getNFT(nft, contract));
                } else {
                    setMetadata(_metadata);
                }
                setError('');
            } catch (e: any) {
                setError(e.message || `Faild to load data of tokenId ${tokenId}`);
            }
        }

        load();
    }, [account, contract, tokenId]);

    return {
        targetAddress,
        setTargetAddress,
        error, handleTransfer,
        metadata
    };
}