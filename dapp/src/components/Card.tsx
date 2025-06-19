import { useEffect, useState } from "react";
import type { Whisky } from "../abis/Whisky";
import Utils from "../models/utils";
import ErrorMessage from "./Error";
import type { NFT } from "../models/storage";
import Card from '@mui/material/Card';
import { CardContent, CardMedia, Typography, Box } from "@mui/material";
import useW3Context from "../hooks/useW3Context";
import Address from "./AddressElement";
import { Link } from "react-router-dom";
export default function CardElement({ nft }: { nft: Whisky.AssetStructOutput }) {
    const w3Contract = useW3Context();
    const { contract, account } = w3Contract;
    const [metadata, setMetadata] = useState<NFT | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!contract || !account) {
            return;
        }
        const load = async () => {
            try {
                const _nft = await Utils.getNFT(nft, contract);
                setMetadata(_nft);
                setError('');
            } catch (e: any) {
                setError(e.message || "Failed to load metadata");
            }
        }

        load();

    }, [nft, contract, account]);

    if (!account || !contract || !metadata || error) {
        return <ErrorMessage error={error} />
    }

    return (
        <Card sx={{ maxWidth: 345 }}>
            {
                metadata.isImage ? (
                    <CardMedia
                        component="img"
                        height="194"
                        image={metadata.file}
                        alt={metadata.name}
                    />
                ) : (
                    <CardMedia
                        component="video"
                        src={metadata.file}
                        controls
                        poster={undefined}
                        style={{ height: 194 }}
                    />

                )
            }

            <CardContent>


                <Link to={`/nfts/${metadata.tokenId}`} style={{ textDecoration: 'none' }}>
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: 'background.paper',
                            transition: '0.3s',
                            '&:hover': {
                                boxShadow: 4,
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            {metadata.name} #{metadata.tokenId}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            Price: {metadata.price} ETH
                        </Typography>
                        <Typography>
                            {metadata.status && <p style={{ color: 'green' }}>Available</p>}
                            {!metadata.status && <p style={{ color: 'red' }}>Archived</p>}
                        </Typography>
                        <Typography>
                            <div>Owner: <Address currentAddress={account.address} targetAddress={metadata.owner} /></div>

                        </Typography>
                    </Box>
                </Link>
            </CardContent>
        </Card>
    );
}