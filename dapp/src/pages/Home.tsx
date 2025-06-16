import Card from "../components/Card";
import ErrorMessage from "../components/Error";
import { useHome } from "../hooks/useHome";


export default function Home() {
    const { nfts, error } = useHome();

    if (!nfts || error) {
        return <ErrorMessage error={!nfts ? 'Wating...' : error} />;
    }

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