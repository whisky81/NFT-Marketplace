import CardList from "../components/CardList";
import ErrorMessage from "../components/Error";
import SearchBar from "../components/SearchBar";
import { useHome } from "../hooks/useHome";


export default function Home() {
    const { nfts, error, filter, setFilter, value, setValue, handleSearch } = useHome();

    if (!nfts || error) {
        return <ErrorMessage error={!nfts ? 'Wating...' : error} />;
    }

    return (<>
        <SearchBar filter={filter} setFilter={setFilter} value={value} setValue={setValue} handleSearch={handleSearch}/>
        <CardList nfts={nfts}/>
    </>);
}