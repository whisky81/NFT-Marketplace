import { InputBase, MenuItem, Select, IconButton, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type SearchBarType = { filter: string, setFilter: React.Dispatch<React.SetStateAction<string>>, value: string, setValue: React.Dispatch<React.SetStateAction<string>>, handleSearch: () => Promise<void> }

export default function SearchBar({ filter, setFilter, value, setValue, handleSearch }: SearchBarType) {

    return (
        <Paper
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: 600,
                borderRadius: 2,
                boxShadow: 1,
                px: 1,
                py: 0.5,
                margin: '20px'
            }}
        >
            <Select
                value={filter}
                onChange={(e) => {
                    setFilter(e.target.value);
                }}
                variant="standard"
                disableUnderline
                sx={{
                    minWidth: 120,
                    fontSize: 14,
                    mr: 1,
                }}
            >
                <MenuItem value="all">All Filters</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="tokenId">Token ID</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
            </Select>

            <InputBase
                sx={{ flex: 1, fontSize: 14 }}
                placeholder="Search by Name / Token ID / Owner"
                type='text'
                value={value}
                onChange={e => setValue(e.target.value)}
            />

            <IconButton sx={{ p: '10px' }} type="submit" onClick={handleSearch}>
                <SearchIcon />
            </IconButton>
        </Paper>
    );
}
