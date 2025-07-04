import type { MetaMaskInpageProvider } from '@metamask/providers';
import { ethers } from 'ethers';

class Account {
    provider: ethers.BrowserProvider;
    signer: ethers.Signer;
    address: string;

    constructor(
        provider: ethers.BrowserProvider,
        signer: ethers.Signer,
        address: string
    ) {
        this.provider = provider;
        this.signer = signer;
        this.address = address;
    }

    static async create(ethereum: MetaMaskInpageProvider): Promise<Account | Error> {
        try {
            const _provider = new ethers.BrowserProvider(ethereum);
            await _provider.send("eth_requestAccounts", []);
            const _signer = await _provider.getSigner();
            const _address = await _signer.getAddress();

            const _account = new Account(_provider, _signer, _address);
            return _account;
        } catch (e: any) {
            return new Error(e.message || "Failed to create Account");
        }
    }

    // async onAccountsChangedEvent() {
    //     const _signer = await this.provider.getSigner();
    //     const _address = await _signer.getAddress();

    //     this.signer = _signer;
    //     this.address = _address;
    // }

    static getShortenAddress(address: string | undefined): string {
        if (!address) {
            return '';
        } 
        return address.slice(0, 6) + "..." + address.slice(-4);
    }

    static getHandleAddress(currentAddress: string, targetAddress: string) {
        if (currentAddress === targetAddress) {
            return "You";
        }
        return Account.getShortenAddress(targetAddress);
    }
}

export default Account;