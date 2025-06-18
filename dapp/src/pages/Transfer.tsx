import { useParams } from "react-router-dom";
import useTransfer from "../hooks/useTransfer";
import ErrorMessage from "../components/Error";
import Loading from "../components/Loading";

import {
    Container, Box, Typography, Paper, TextField, Button
} from '@mui/material';
import Preview from "../components/Preview";
import type { NFT } from "../models/storage";


type Params = {
    tokenId: string;
}

export default function Transfer({ _metadata = null }: { _metadata: NFT | null }) {
    const params = useParams<Params>();
    const { targetAddress, setTargetAddress, error, handleTransfer, metadata } = useTransfer(params.tokenId, _metadata);

    if (error) {
        return <ErrorMessage error={error} />
    }

    if (!metadata) {
        return <Loading />;
    }

    return (
        <>
            <Box><ErrorMessage error="After the transfer is successful, please wait a moment for the transaction to be recorded on the blockchain" /></Box>

            <Container
                maxWidth="xs"
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    py: { xs: 4, md: 6 }
                }}
            >

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', p: 2 }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 3.5, textAlign: 'center' }}>
                        Transfer
                    </Typography>

                    <Paper
                        elevation={2}
                        sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            mb: 3.5,
                            display: 'inline-block',
                            backgroundColor: 'common.white',
                        }}
                    >
                        <Preview url={metadata.file} isImage={metadata.isImage} />
                    </Paper>

                    <Typography
                        variant="body1"
                        sx={{ mb: 1.5, alignSelf: 'flex-start', width: '100%', fontWeight: 500 }}
                    >
                        Transfer "{metadata.name}" to:
                    </Typography>

                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="e.g. 0x1ed3... or destination.eth, destination.lens"
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                            },
                        }}
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleTransfer}
                        sx={{
                            backgroundColor: '#B7D3EB',
                            color: '#37474F',
                            '&:hover': { backgroundColor: '#A1C5E0' },
                            textTransform: 'none',
                            fontWeight: 500,
                            py: 1.25,
                            borderRadius: '8px',
                            boxShadow: 'none',
                        }}
                    >
                        Transfer
                    </Button>
                </Box>
            </Container>
        </>
    );
}