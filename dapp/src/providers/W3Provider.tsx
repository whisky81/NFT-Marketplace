import type { MetaMaskInpageProvider } from '@metamask/providers';
import { createContext, useEffect, useState } from 'react';

import Account from '../models/account';
import WhiskyContract from "../../../artifacts/contracts/Whisky.sol/Whisky.json";
import type { Whisky } from "../abis/Whisky";
import { ethers } from "ethers";
import { PinataSDK } from 'pinata';

declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider
    }
}

interface W3ContextType {
    account: Account | null,
    contract: Whisky | null,
    isLoading: boolean,
    error: string,
    pinata: PinataSDK | null
}

export const Web3Context = createContext<W3ContextType>({
    account: null,
    contract: null,
    isLoading: true,
    error: '',
    pinata: null
})

export default function W3Provider({ children }: { children: React.ReactNode }) {
    const [account, setAccount] = useState<Account | null>(null);
    const [contract, setContract] = useState<Whisky | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState('');
    const [pinata, setPinata] = useState<PinataSDK | null>(null);

    useEffect(() => {
        const initWeb3 = async () => {
            try {
                if (!window.ethereum) {
                    throw new Error("MetaMask is not installed.");
                }

                const data = await Account.create(window.ethereum);
                if (data instanceof Error) {
                    throw data;
                }
                const _contract = new ethers.Contract(
                    "0x5fbdb2315678afecb367f032d93f642f64180aa3", 
                    WhiskyContract.abi, 
                    data.signer
                ) as unknown as Whisky;
                const _pinata = new PinataSDK({
                    pinataJwt: "",
                    pinataGateway: import.meta.env.VITE_GATEWAY_URL
                });
                
                setAccount(data);
                setContract(_contract);
                setError('');
                setPinata(_pinata);

                window.ethereum.on('chainChanged', () => {
                    window.location.reload();
                })
                window.ethereum.on('accountsChanged', () => {
                    window.location.reload();
                })
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError(e.message);
                }
            } finally {
                setIsLoading(false);
            }
        }
        initWeb3();

        return () => {
            window.ethereum?.removeAllListeners();
        }
    }, []);

    return <Web3Context.Provider value={{
        account,
        contract,
        isLoading,
        error,
        pinata
    }}>
        {children}
    </Web3Context.Provider>;
}