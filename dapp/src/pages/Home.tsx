import Card from "../components/Card";
import ErrorMessage from "../components/Error";
import { useHome } from "../hooks/useHome";


export default function Home() {
    const { nfts, error } = useHome();

    if (!nfts || error) {
        if (!nfts) {
            return <ErrorMessage error="Wating..."/>;
        }
        return <ErrorMessage error={error}/>;
    }

    return (<div style={{ margin: '10px' }}>
        {Array.from(nfts.keys()).map((k, i) => (
            <div key={i}>
                <Card nft={nfts.get(k)}/>
            </div>
        ))}
    </div>);
}