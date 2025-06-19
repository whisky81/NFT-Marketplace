import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Account from "../models/account";


export default function Address({ currentAddress, targetAddress}: {currentAddress: string, targetAddress: string}) {
    return (<Typography
        variant="caption"
        color="text.secondary"
        sx={{
            display: 'inline-block',
            mt: 1,
            fontSize: '0.75rem',
            fontWeight: 500,
            '& a': {
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.main',
                },
            },
        }}
    >
        <Link to={`/profile/${targetAddress}`}>
            {Account.getHandleAddress(currentAddress, targetAddress)}
        </Link>
    </Typography>);
}