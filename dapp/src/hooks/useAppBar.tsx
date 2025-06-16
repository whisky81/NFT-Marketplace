import * as React from 'react';
import useW3Context from './useW3Context';
import { formatEther } from 'ethers';

const pages = ['NFTs', 'Create', 'About Contract'];

export default function useAppBar() {
    const w3Context = useW3Context();
    const { account, contract } = w3Context;

    const [walletETH, setWalletETH] = React.useState('');
    const [contractETH, setContractETH] = React.useState('');
    const [symbol, setSymbol] = React.useState('');
    const [error, setError] = React.useState('');

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    
    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };


    React.useEffect(() => {
        const load = async () => {
            try {
                if (!account || !contract) {
                    throw new Error("Failed to fetch balance");
                }
                const _walletETH = formatEther(await account.provider.getBalance(account.address));
                const _contractETH = formatEther(await contract.balance());
                const _symbol = await contract.symbol();

                setWalletETH(_walletETH);
                setContractETH(_contractETH);
                setSymbol(_symbol);
                setError('');

                account.provider.on('block', async () => {
                    const _updateWalletETH = formatEther(await account.provider.getBalance(account.address));
                    const _updateContractETH = formatEther(await contract.balance());
                    setWalletETH(_updateWalletETH);
                    setContractETH(_updateContractETH);
                });
            } catch (e: any) {
                setError(e.message || "Failed to fetch balance");
            }
        }
        load();
        return () => {
            account?.provider.removeAllListeners();
        }
    }, [account, contract]);

    return {
        anchorElNav,
        handleOpenNavMenu,
        handleCloseNavMenu,
        pages,
        walletETH,
        contractETH,
        symbol,
        error,
        address: account?.address
    };
}