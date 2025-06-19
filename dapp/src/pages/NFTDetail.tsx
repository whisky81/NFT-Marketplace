import { useParams, Link } from "react-router-dom";
import useNFTDetail from "../hooks/useNFTDetail";
import ErrorMessage from "../components/Error";
import Loading from "../components/Loading";
import TransferEvent from '../components/TransferEvent';
import { AppBar, Toolbar, IconButton, Box, Tooltip, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import {
    Send as SendIcon,
} from '@mui/icons-material';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import {
    Typography,
    Container,
    Grid,
    Paper,
    Button,
    Stack,
} from '@mui/material';
import {
    Description as DescriptionIcon,
    Style as StyleIcon,
    ListAlt as ListAltIcon,
    History as HistoryIcon,
    LocalOffer as LocalOfferIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import Preview from "../components/Preview";
import Address from "../components/AddressElement";

type Params = {
    tokenId: string;
}

export default function NFTDetail() {
    const params = useParams<Params>();
    const { metadata, error, handleBurn, account, handleBuy, isLoading } = useNFTDetail(params.tokenId);


    if (error) {
        return <ErrorMessage error={error} />
    }
    if (!account || !metadata || isLoading) {
        return <Loading />;
    }

    const AccordionSection = ({ id, title, icon, children }: { id: any, title: any, icon: any, children: any }) => (
        <Accordion
            // expanded={expandedAccordion[id]}
            // onChange={handleAccordionChange(id)}
            sx={{ '&:before': { display: 'none' }, boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}
            disableGutters
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${id}-content`}
                id={`${id}-header`}
                sx={{ flexDirection: 'row-reverse', py: 0.5, minHeight: '48px' }}
            >
                {icon}
                <Typography sx={{ fontWeight: 'medium', ml: 1 }}>{title}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                {children}
            </AccordionDetails>
        </Accordion>
    );


    return (<>
        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Toolbar>
                <IconButton edge="start" color="inherit"><AllInclusiveIcon /></IconButton>
                <Box sx={{ flexGrow: 1 }} />
                {account.address === metadata.owner && (
                    <Tooltip title="Transfer"><IconButton color="inherit"><Link to={`/transfer/${metadata.tokenId}`}><SendIcon /></Link></IconButton></Tooltip>
                )}
                {account.address === metadata.owner && (
                    <Tooltip title="Burn"><IconButton color="secondary" onClick={handleBurn}><DeleteForeverIcon /></IconButton></Tooltip>
                )}
            </Toolbar>
        </AppBar>


        <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                <Box sx={{ width: { xs: '100%', md: '40%' }, display: 'flex', flexDirection: 'column' }}>
                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{
                            height: 600,
                            backgroundColor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            overflow: 'auto'
                        }}>
                            <Preview url={metadata.file} isImage={metadata.isImage} />
                        </Box>

                        <Box>
                            <AccordionSection id="description" title="Description" icon={<DescriptionIcon fontSize="small" color="action" />}>

                                <Typography variant="body2" sx={{ maxHeight: 150, overflowY: 'auto', fontSize: '0.875rem' }}>{metadata.description}</Typography>
                            </AccordionSection>
                            <AccordionSection id="traits" title="Traits" icon={<StyleIcon fontSize="small" color="action" />}>
                                <Grid container spacing={1}>
                                    {metadata.attributes.map(({ trait_type, value }, i) => (
                                        <Grid key={i}>
                                            <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', backgroundColor: 'grey.50' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{trait_type}</Typography>
                                                <Typography variant="subtitle2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>{value}</Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionSection>
                            <AccordionSection id="details" title="Details" icon={<ListAltIcon fontSize="small" color="action" />}>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                    <Typography variant="body2">Token ID: {metadata.tokenId}</Typography>
                                    <Typography variant="body2">Price: {metadata.price}</Typography>
                                    <Typography variant="body2">Name: {metadata.name}</Typography>
                                    <Typography variant="body2">Description: {metadata.description}</Typography>
                                    <Typography variant="body2">External Link: <Link to={metadata.external_url}>Visit</Link></Typography>
                                    <Typography variant="body2">Owner: <Address currentAddress={account.address} targetAddress={metadata.owner} /></Typography>
                                    <Typography variant="body2">{metadata.status ? "Available" : "Archived"}</Typography>
                                </Typography>
                            </AccordionSection>
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ width: { xs: '100%', md: '60%' }, display: 'flex', flexDirection: 'column' }}>
                    <Stack spacing={2.5}>
                        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="h4" component="h1" fontWeight="bold">{`${metadata.name} #${metadata.tokenId}`}</Typography>
                            <Typography variant="body2" color="text.secondary">Owned by <Address currentAddress={account.address} targetAddress={metadata.owner} /></Typography>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="h5" component="h1" fontWeight="bold">Buy For {metadata.price} ETH</Typography>
                            {metadata.owner === account.address ? (
                                <Typography variant="body2" color="text.secondary">Owned by <Address currentAddress={account.address} targetAddress={metadata.owner} /></Typography>
                            ) : (
                                <Button variant="contained" color="primary" fullWidth startIcon={<LocalOfferIcon />} size="large" onClick={handleBuy}>
                                    Buy Now
                                </Button>
                            )}
                        </Paper>

                        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <AccordionSection id="listings" title="Transaction History" icon={<HistoryIcon fontSize="small" color="action" />}>
                                <TransferEvent metadata={metadata} />
                            </AccordionSection>
                        </Paper>
                    </Stack>
                </Box>
            </Box>
        </Container>
    </>);

}