import { useEffect, useState } from "react";
import useW3Context from "./useW3Context";
import { formatEther } from "ethers";
import type { Whisky } from "../abis/Whisky";

interface Stats {
    owned: string;
    walletBalance: string;
    contractBalance: string;
}

export default function useProfile(targetAddress: string | undefined) {
    const w3Context = useW3Context();
    const { account, contract } = w3Context;

    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState('');
    const [nfts, setNfts] = useState<Whisky.AssetStructOutput[] | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(account === null ? '' : account.address);
    };

    useEffect(() => {
        if (!targetAddress || !account || !contract) {
            return;
        }
        const load = async () => {
            try {
                const owned: bigint = await contract.balanceOf(targetAddress);
                const walletBalance: bigint = await account.provider.getBalance(targetAddress);
                const contractBalance: bigint = await contract.balance();
                const _nfts = await contract.getTokensOf(targetAddress);

                setNfts(_nfts);
                setStats({
                    owned: owned.toString(),
                    walletBalance: formatEther(walletBalance),
                    contractBalance: formatEther(contractBalance)
                });
                setError('');

                account.provider.on('block', async () => {
                    const updateOwned = await contract.balanceOf(targetAddress);
                    const updateWalletBalance = formatEther(await account.provider.getBalance(targetAddress));
                    const updateContractBalance = formatEther(await contract.balance());

                    const updateNfts = await contract.getTokensOf(targetAddress);

                    setNfts(updateNfts);
                    setStats({
                        owned: updateOwned.toString(),
                        walletBalance: updateWalletBalance,
                        contractBalance: updateContractBalance
                    });
                });
            } catch(e: any) {
                setError(e.message || "Failed to fetch");
            }
        }

        load();
        return () => {
            account.provider.removeAllListeners();
        };
    }, [targetAddress, account, contract]);

    return { handleCopy, error, stats, nfts };
}