import { useEffect, useState } from "react";
import useW3Context from "./useW3Context";
import type { NFT } from "../models/storage";
import Utils from "../models/utils";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";


export default function useNFTDetail(tokenId: string | undefined) {
    const navigate = useNavigate();
    const w3Context = useW3Context();
    const { account, contract } = w3Context;

    const [metadata, setMetadata] = useState<NFT | null>();
    const [error, setError] = useState('');
    const [isLoading, setIsloading] = useState(false);

    const handleResell = async () => {
        try {
            setIsloading(true);
            if (!account || !contract || !metadata) {
                throw new Error("Burn Failed");
            }
            const tx = await contract.resell(metadata.tokenId);
            await tx.wait();
            navigate(`/profile/${account.address}`);
        } catch (e: any) {
            setError(e.message || "Resell Failed");
        }
    }

    const handleBurn = async () => {
        try {
            setIsloading(true);
            if (!account || !contract || !metadata) {
                throw new Error("Burn Failed");
            }
            const tx = await contract.burn(metadata.tokenId);
            await tx.wait();
            navigate(`/profile/${account.address}`);
        } catch (e: any) {
            setError(e.message || "Burn Failed");
        }
    }

    const handleBuy = async () => {
        try {
            setIsloading(true);
            if (!account || !contract || !metadata) {
                throw new Error("Buy Failed");
            }

            const tx = await contract.buy(metadata.tokenId, {
                value: ethers.parseEther(metadata.price)
            });
            await tx.wait();

            navigate(`/profile/${account.address}`);

        } catch (e: any) {
            setError(e.message || "Burn Failed");
        }
    }

    useEffect(() => {
        if (!tokenId || !account || !contract) return;
        const load = async () => {
            try {
                const nft = await contract.getTokenById(tokenId);
                const metadata = await Utils.getNFT(nft, contract);

                setMetadata(metadata);
                setError('');

                account.provider.on('block', async () => {
                    const updateNft = await contract.getTokenById(tokenId);
                    const updateMetadata = await Utils.getNFT(updateNft, contract);
                    setMetadata(updateMetadata);
                });
            } catch (e: any) {
                setError(e.message || "Failed to fetch metadata");
            }
        }

        load();
        return () => {
            account?.provider.removeAllListeners();
        }
    }, [tokenId, account, contract]);

    return { metadata, error, handleBurn, account, handleBuy, isLoading, handleResell };
}