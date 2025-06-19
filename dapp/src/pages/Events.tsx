import { useEffect, useState } from "react";
import useW3Context from "../hooks/useW3Context";
import type { ApprovalEvent, ApprovalForAllEvent, TransferEvent } from "../abis/Whisky";
import ErrorMessage from "../components/Error";
import ContractEvents from "../models/contracts";

import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper,
    Tooltip
} from '@mui/material';
import Address from "../components/AddressElement";
import Loading from "../components/Loading";

export default function Events() {
    const w3Context = useW3Context();
    const { account, contract } = w3Context;

    const [trasferEvents, setTransferEvent] = useState<TransferEvent.OutputObject[]>([]);
    const [approvalEvents, setApprovalEvents] = useState<ApprovalEvent.OutputObject[]>([]);
    const [approvalForAllEvents, setApprovalForAllEvents] = useState<ApprovalForAllEvent.OutputObject[]>([]);
    const [error, setError] = useState('');

    const setEvent = async () => {
        try {
            if (!contract) {
                throw new Error("Waiting");
            }
            const _transferEvents = await ContractEvents.getTransferEvent(contract);
            const _approvalEvents = await ContractEvents.getApprovalEvent(contract);
            const _approvalForAllEvents = await ContractEvents.getApprovalForAllEvent(contract);
            setTransferEvent(_transferEvents);
            setApprovalEvents(_approvalEvents);
            setApprovalForAllEvents(_approvalForAllEvents);
        } catch (e) {
            throw e;
        }
    }

    useEffect(() => {

        const load = async () => {
            try {
                if (!account || !contract) {
                    throw new Error("Wating...");
                }
                await setEvent();
                account.provider.on('block', async () => {
                    await setEvent();
                });


            } catch (e: any) {
                setError(e.message || "Failed to fetch events");
            }
        }
        load();
        return () => {
            account?.provider.removeAllListeners();
        }
    }, [account, contract]);

    if (error) {
        return <ErrorMessage error={error} />;
    }
    if (!account || !contract) {
        return <Loading />;
    }

    return (<>
        <h2>Transfer Event</h2>
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
                    {trasferEvents.map((transfer, index) => (
                        <TableRow key={index}>
                            <TableCell>{transfer.from === '0x0000000000000000000000000000000000000000' ? 'Mint' : 'Transfer'}</TableCell>
                            <TableCell><Tooltip title={transfer.from}><Address currentAddress={account.address} targetAddress={transfer.from} /></Tooltip></TableCell>
                            <TableCell><Tooltip title={transfer.to}><Address currentAddress={account.address} targetAddress={transfer.to} /></Tooltip></TableCell>
                            <TableCell>{transfer.tokenId.toString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <h2>Approval Event</h2>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Owner</TableCell>
                        <TableCell>Approved</TableCell>
                        <TableCell>Token ID</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {approvalEvents.map((approval, index) => (
                        <TableRow key={index}>
                            <TableCell><Address currentAddress={account.address} targetAddress={approval.owner} /></TableCell>
                            <TableCell><Address currentAddress={account.address} targetAddress={approval.approved} /></TableCell>
                            <TableCell>{approval.tokenId.toString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <h2>Approval For All Event</h2>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Owner</TableCell>
                        <TableCell>Operator</TableCell>
                        <TableCell>Approved</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {approvalForAllEvents.map((approval, index) => (
                        <TableRow key={index}>
                            <TableCell><Address currentAddress={account.address} targetAddress={approval.owner} /></TableCell>
                            <TableCell><Address currentAddress={account.address} targetAddress={approval.operator} /></TableCell>
                            <TableCell>{approval.approved ? "Yes" : "No"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </>);
}