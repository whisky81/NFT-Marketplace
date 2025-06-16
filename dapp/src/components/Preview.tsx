import { Box } from "@mui/material";

// Only accept image/ and video/
export default function Preview({ url, isImage }: { url: string, isImage: boolean }) {
    if (!isImage) {
        return (<Box mt={3} sx={{ width: '100%', maxHeight: 345 }}>
            <video
                src={url}
                controls
                style={{ width: '100%', height: 'auto', maxHeight: '100%' }}
            />
        </Box>);
    }

    return (<Box
        component="img"
        src={url}
        alt="Preview"
        sx={{ maxHeight: 345, width: '100%', objectFit: 'contain' }}
    />)
}