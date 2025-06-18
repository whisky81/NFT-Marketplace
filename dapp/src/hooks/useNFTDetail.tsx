import { useEffect, useState } from "react";
import useW3Context from "./useW3Context";
import type { NFT } from "../models/storage";
import Utils from "../models/utils";
import { useNavigate } from "react-router-dom";


export default function useNFTDetail(tokenId: string | undefined) {
    const navigate = useNavigate();
    const w3Context = useW3Context();
    const { account, contract } = w3Context;

    const [metadata, setMetadata] = useState<NFT | null>();
    const [error, setError] = useState('');

    const handleBurn = async () => {
        try {
            if (!account || !contract || !metadata) {
                throw new Error("Burn Failed");
            }
            await contract.burn(metadata.tokenId);
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
            } catch(e: any) {
                setError(e.message || "Failed to fetch metadata");
            }
        }
        
        load();
    }, [tokenId, account, contract]);

    return { metadata, error, handleBurn, account };
}