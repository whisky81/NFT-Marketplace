import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";
import type { FormData } from "../models/storage";
import useW3Context from '../hooks/useW3Context';
import ErrorMessage from './Error';
import Utils from '../models/utils';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const steps = ['Sign In With Ethereum', 'Upload To IPFS', 'Minting'];

type AutoProcessType = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    data: FormData,
    file: File
}

export default function AutoProcess({ open, setOpen, data, file }: AutoProcessType) {
    const w3Context = useW3Context();

    const {pinata, contract, account} = w3Context;
    if (!pinata || !contract || !account) {
        return <ErrorMessage error="Unknow Error"/>;
    }

    const navigate = useNavigate();
    const [activeStep, setActiveStep] = React.useState(0);
    const [error, setError] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    // Memoize upload function
    const upload = React.useCallback(async () => {
        let _cids: string[] = [];
        try {
            await Utils.signInWithEthereum(account, window);
            handleNext();

            _cids = await Utils.uploadToIPFS(pinata, file, data);
            handleNext();

            await contract.safeMint(data.name, _cids[0]);
            handleNext();

            setError('');
            navigate("/");
        } catch (error) {
            setError("Failed to create NFT");
            // send _cids to server to unpin
        }
    }, [pinata, file, data, contract, navigate]);

    React.useEffect(() => {
        if (open) {
            upload();
        }
    }, [open, upload]);

    const stepElements = React.useMemo(() =>
        steps.map((label) => (
            <Step key={label}>
                <StepLabel>{label}</StepLabel>
            </Step>
        )), []);
    
    if (error) {
        return <ErrorMessage error={error}/>
    }

    return (
        <>
            <Button variant="outlined" onClick={handleClickOpen}>
                Create
            </Button>
            <BootstrapDialog
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Mint NFT
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ width: '100%' }}>
                        <Stepper activeStep={activeStep}>
                            {stepElements}
                        </Stepper>
                        {activeStep === steps.length ? (
                            <Typography sx={{ mt: 2, mb: 1 }}>
                                All steps completed - you're finished
                            </Typography>
                        ) : (
                            <>
                                <Typography sx={{ mt: 2, mb: 1 }}>
                                    Step {activeStep + 1}
                                </Typography>
                                <CircularProgress />
                            </>
                        )}
                    </Box>
                </DialogContent>
            </BootstrapDialog>
        </>
    );
}
