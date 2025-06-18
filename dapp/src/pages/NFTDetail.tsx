import { useParams } from "react-router-dom";
import useNFTDetail from "../hooks/useNFTDetail";
import ErrorMessage from "../components/Error";
import Loading from "../components/Loading";


type Params = {
    tokenId: string;
}

export default function NFTDetail() {
    const params = useParams<Params>();
    const { metadata, error, handleBurn, account } = useNFTDetail(params.tokenId);

    if (error) {
        return <ErrorMessage error={error}/>
    }
    if (!account || !metadata) {
        return <Loading />;
    }

    return (<div>
        <div>TOKEN ID</div>
        <div>{params.tokenId}</div>
        {account.address === metadata.owner && (
            <button type='button' onClick={handleBurn}>Burn</button>
        )}
    </div>);

}