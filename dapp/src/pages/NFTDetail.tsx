import { useParams } from "react-router-dom";
import useNFTDetail from "../hooks/useNFTDetail";
import ErrorMessage from "../components/Error";


type Params = {
    tokenId: string;
}

export default function NFTDetail() {
    const params = useParams<Params>();
    const { metadata, error } = useNFTDetail(params.tokenId);

    if (!metadata || error) {
        return <ErrorMessage error={!metadata ? 'Wating...' : error}/>
    }

    return (<div>
        <div>TOKEN ID</div>
        <div>{params.tokenId}</div>
    </div>);

}