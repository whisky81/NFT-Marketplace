import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

export default function Loading() {
  return (
    <Box
      sx={{
        height: '100vh',                
        display: 'flex',                
        justifyContent: 'center',       
        alignItems: 'center',            
      }}
    >
      <Box sx={{ width: '200px' }}>
        <LinearProgress />
      </Box>
    </Box>
  );
}
