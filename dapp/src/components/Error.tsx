import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { Skeleton, Card } from '@mui/material';

interface ErrorProps {
  error: string;
}

export default function ErrorMessage({ error }: ErrorProps) {
  if (error) {
    return (<Box sx={{ m: 2 }}>
      <Alert severity="error">{error}</Alert>
    </Box>)
  }
  return (
    <Card sx={{ maxWidth: 345, minHeight: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Skeleton variant="rectangular" width="100%" height={194} />
    </Card>
  );
}

