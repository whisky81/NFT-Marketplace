import type { Whisky } from "../abis/Whisky";
import Card from "./Card";
export default function CardList({ nfts }: { nfts: Whisky.AssetStructOutput[] }) {
    return (<div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
        padding: '16px',
    }}>
        {nfts.map((nft, i) => (
            <div key={i}>
                <Card nft={nft} />
            </div>
        ))}
    </div>);
}