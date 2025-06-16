import { useEffect, useState } from "react";
import useW3Context from "./useW3Context";
import type { NFT } from "../models/storage";
import Utils from "../models/utils";


export default function useNFTDetail(tokenId: string | undefined) {
    const w3Context = useW3Context();
    const { account, contract } = w3Context;

    const [metadata, setMetadata] = useState<NFT | null>();
    const [error, setError] = useState('');

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

    return { metadata, error };
}