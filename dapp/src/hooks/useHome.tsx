import { useEffect, useState } from "react";
import type { Whisky, TransferEvent } from "../abis/Whisky";
import useW3Context from "./useW3Context";
export function useHome() {
    const w3Context = useW3Context();
    const { contract } = w3Context;

    const [nfts, setNfts] = useState<Whisky.AssetStructOutput[] | null>(null);
    const [error, setError] = useState('');


    useEffect(() => {
        if (!contract) {
            return;
        }
        const load = async () => {
            try {
                const _nfts = await contract.getAvailableTokens();
                setNfts(_nfts);

                contract.on(contract.filters.Transfer(), async (event: any) => {
                    const _args = event.args as TransferEvent.OutputObject;
                    
                    if (_args.from === '0x0000000000000000000000000000000000000000') {
                        const _nfts = await contract.getAvailableTokens();
                        setNfts(_nfts);
                    }
                })
            } catch (e: any) {
                setError(e.message || "Failed to fetch metadata");
            }
        }

        load();
        return () => {
            contract.removeAllListeners();
        }
    }, []);

    return {
        nfts,
        error
    };
}