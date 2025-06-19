
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper,
} from '@mui/material';

export default function AboutContract() {
    return (<TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Networks</TableCell>
                    <TableCell>Contract Address</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>

                <TableRow>
                    <TableCell>Localhost</TableCell>
                    <TableCell>0x5FbDB2315678afecb367f032d93F642f64180aa3</TableCell>
                </TableRow>

            </TableBody>
        </Table>
    </TableContainer>);
}