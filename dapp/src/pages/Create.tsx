import {
    Container, Typography, Grid, Box, TextField, Button, Stack, Chip,
} from '@mui/material';
import {
    Add,
    CloudUpload,
    Delete,
} from '@mui/icons-material';
import AutoProcess from '../components/AutoProcess';
import useCreate from '../hooks/useCreate';
import Preview from '../components/Preview';
import AddTrait from '../components/AddTrait';
import ErrorMessage from '../components/Error';


const CreateNftFormV2 = () => {
    const {
        file,
        isTraitModalOpen,
        fileInputRef,
        handleFileChange,
        handleRemoveTrait,
        data, setData,
        setTraitModalOpen,
        open, setOpen
    } = useCreate();

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <ErrorMessage error='After you finish creating a new NFT, please wait for a moment for it to be recorded on the blockchain'/>
            <Typography variant="h4" gutterBottom>Create NFT</Typography>
            <Typography color="text.secondary" mb={4}>Once minted, item info is permanent.</Typography>
            <Grid container spacing={4}>
                {/* @ts-ignore */}
                <Grid item xs={12} md={6}>
                    <Box
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            border: '2px dashed grey',
                            borderRadius: 2,
                            height: 345,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            backgroundColor: '#fafafa',
                            overflow: 'auto',
                            maxWidth: '100%',
                        }}
                    >
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                        />

                        {file && <Preview url={URL.createObjectURL(file)} isImage={file.type.includes("image/")} />}
                        {!file && (<Stack alignItems="center">
                            <CloudUpload sx={{ fontSize: 50, mb: 1 }} />
                            <Typography>Click or drag media to upload (MAX SIZE 20 MB)</Typography>
                        </Stack>)}


                    </Box>
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} md={6}>
                    <Stack spacing={3}>
                        <TextField
                            label="Name"
                            fullWidth
                            required
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                        />

                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={data.description}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                        />

                        <TextField
                            label="External link"
                            fullWidth
                            value={data.external_url}
                            onChange={(e) => setData({ ...data, external_url: e.target.value })}
                        />

                        <Box>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle1">Traits</Typography>
                                <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => setTraitModalOpen(true)}>
                                    Add
                                </Button>
                            </Stack>
                            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                                {data.attributes?.map((trait, index) => (
                                    <Chip
                                        key={index}
                                        label={`${trait.trait_type}: ${trait.value}`}
                                        onDelete={() => handleRemoveTrait(index)}
                                        deleteIcon={<Delete />}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>


            {file && (<Box textAlign="right" mt={4}>
                <AutoProcess open={open} setOpen={setOpen} data={data} file={file} />
            </Box>)}

            <AddTrait setData={setData} isTraitModalOpen={isTraitModalOpen} setTraitModalOpen={setTraitModalOpen} />
        </Container>
    );
};
export default CreateNftFormV2;