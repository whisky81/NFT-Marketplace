import {
    TextField,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useState } from 'react';
import type { Trait, FormData } from '../hooks/useCreate';

type AddTraitType = { isTraitModalOpen: boolean, setTraitModalOpen: React.Dispatch<React.SetStateAction<boolean>>, setData: React.Dispatch<React.SetStateAction<FormData>> };

export default function AddTrait({ isTraitModalOpen, setTraitModalOpen, setData }: AddTraitType) {
    const [newTraitType, setNewTraitType] = useState('');
    const [newTraitName, setNewTraitName] = useState('');
    const handleAddTrait = () => {
        if (newTraitType && newTraitName) {
            const newTrait: Trait = { trait_type: newTraitType, value: newTraitName }


            setData(prev => ({
                ...prev,
                attributes: [...prev.attributes, newTrait]
            }));

            setNewTraitType('');
            setNewTraitName('');
            setTraitModalOpen(false);
        }
    };

    return (<Dialog open={isTraitModalOpen} onClose={() => setTraitModalOpen(false)}>
        <DialogTitle>
            Add Trait
            <IconButton
                sx={{ position: 'absolute', right: 8, top: 8 }}
                onClick={() => setTraitModalOpen(false)}
            >
                <Close />
            </IconButton>
        </DialogTitle>
        <DialogContent>
            <Stack spacing={2} pt={1}>
                <TextField
                    label="Trait Type"
                    value={newTraitType}
                    onChange={(e) => setNewTraitType(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Trait Name"
                    value={newTraitName}
                    onChange={(e) => setNewTraitName(e.target.value)}
                    fullWidth
                />
            </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button fullWidth variant="contained" onClick={handleAddTrait}>Add</Button>
        </DialogActions>
    </Dialog>);
}