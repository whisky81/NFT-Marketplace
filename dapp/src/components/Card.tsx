import { useEffect, useState } from "react";
import type { Whisky } from "../abis/Whisky";
import Utils from "../models/utils";
import ErrorMessage from "./Error";
import type { NFT } from "../models/storage";
import Card from '@mui/material/Card';
import { CardContent, CardMedia, Typography } from "@mui/material";

export default function CardElement({ nft }: { nft: Whisky.AssetStructOutput | undefined }) {
    const [metadata, setMetadata] = useState<NFT | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!nft) {
                return;
            }
            try {
                const _nft = await Utils.getNFT(nft);
                setMetadata(_nft);
                setError('');
            } catch (e: any) {
                setError(e.message || "Failed to load metadata");
            }
        }

        load();

    }, [nft]);

    if (!nft || !metadata || error) {
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
                <h3>{metadata.name}</h3>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Price: {metadata.price} ETH
                </Typography>
                {metadata.status && <p style={{ color: 'green' }}>Sale</p>}
                {!metadata.status && <p style={{ color: 'red' }}>Sale</p>}
            </CardContent>
        </Card>
    );
}