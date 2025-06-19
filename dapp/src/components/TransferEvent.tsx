import { useEffect, useState } from "react";
import useW3Context from "../hooks/useW3Context";
import type { NFT } from "../models/storage";
import ErrorMessage from "./Error";
import type { TransferEvent } from "../abis/Whisky";

import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField
} from '@mui/material';
import Address from "./AddressElement";


export default function TransferEvent({ metadata }: { metadata: NFT }) {
    const w3Context = useW3Context();
    const { account, contract } = w3Context;

    const [transfers, setTransfers] = useState<TransferEvent.OutputObject[]>([]);
    const [targetTransfers, setTargetTransfers] = useState<TransferEvent.OutputObject[]>([]);
    const [error, setError] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value === '') {
            setTargetTransfers(transfers);
            return;
        }
        setTargetTransfers(transfers.filter(transfer => (
            transfer.from === value ||
            transfer.to === value || 
            transfer.tokenId.toString() === value
        )));
    }


    useEffect(() => {
        const load = async () => {
            try {
                if (!account || !contract) {
                    throw new Error('wating for initialization');
                }
                const events = await contract.queryFilter(contract.filters.Transfer(), 0, "latest");

                const _transfers: TransferEvent.OutputObject[] = [];
                for (const e of events) {
                    if (e.args.tokenId.toString() === metadata.tokenId) {
                        _transfers.push(e.args);
                    }
                }


                setTransfers(_transfers);
                setTargetTransfers(_transfers);
                setError('');
            } catch (e: any) {
                setError(e.message || "Load Error");
            }
        }

        load();
    }, [account, contract, metadata]);

    if (!account || !contract || error) {
        return <ErrorMessage error={error ? error : "Waiting..."} />;
    }


    return (<Card>
        <CardContent>
            <Typography variant="h6" gutterBottom align="center">
                Transfer History
            </Typography>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <TextField
                    label="Search From / To / Token ID"
                    variant="outlined"
                    onChange={handleSearch}
                    fullWidth
                />
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>From</TableCell>
                            <TableCell>To</TableCell>
                            <TableCell>Token ID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {targetTransfers.map((transfer, index) => (
                            <TableRow key={index}>
                                <TableCell>{transfer.from === '0x0000000000000000000000000000000000000000' ? 'Mint' : 'Transfer'}</TableCell>
                                <TableCell><Address currentAddress={account.address} targetAddress={transfer.from}/></TableCell>
                                <TableCell><Address currentAddress={account.address} targetAddress={transfer.to}/></TableCell>
                                <TableCell>{transfer.tokenId.toString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </CardContent>
    </Card>);

}