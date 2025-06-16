
import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Button
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Account from '../models/account';
import { useParams } from 'react-router-dom';
import useProfile from '../hooks/useProfile';
import ErrorMessage from '../components/Error';
import CardList from '../components/CardList';
import useW3Context from '../hooks/useW3Context';

type Params = {
  account: string;
}

const Profile = () => {
  const params = useParams<Params>();
  const targetAddress = params.account;
  const w3Context = useW3Context();
  const { account } = w3Context;
  const { handleCopy, error, stats, nfts, withdraw } = useProfile(params.account);

  if (!account || !stats || !nfts || !targetAddress || error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center">
          <Avatar
            src={""}
            alt="User Avatar"
            sx={{ width: 96, height: 96, fontSize: 32 }}
          >
            0x0
          </Avatar>

          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">{Account.getHandleAddress(account.address, targetAddress)}</Typography>
              <Tooltip title="Copy address">
                <IconButton onClick={handleCopy}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {Account.getHandleAddress(account.address, targetAddress)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Owned
                </Typography>
                <Typography fontWeight="bold">{stats.owned}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Wallet Balance
                </Typography>
                <Typography fontWeight="bold">{stats.walletBalance} ETH</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Contract Balance
                </Typography>
                <Typography fontWeight="bold">{stats.contractBalance} ETH</Typography>
              </Box>
              {(account.address === targetAddress) && <Box>
                <Typography variant="subtitle2" color="red">!!! After you finish withdrawing from contract, please wait for a moment for it to be recorded on the blockchain</Typography>
                <Button type='button' onClick={withdraw} variant="contained"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  bgcolor: 'white',
                  color: 'black',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: '#80cbc4'
                  }
                }}>Withdraw From Contract</Button></Box>}
            </Stack>
          </Box>
        </Stack>
      </Paper>
      <CardList nfts={nfts} />
    </>
  );
};

export default Profile;
