import { BrowserRouter, Routes, Route } from 'react-router-dom';

import useW3Context from './hooks/useW3Context';
import ResponsiveAppBar from './components/AppBar';
import Loading from './components/Loading';
import ErrorMessage from './components/Error';
import NotFound from "./pages/NotFound";
import Create from './pages/Create';
import Home from './pages/Home';
import NFTDetail from './pages/NFTDetail';
import Profile from './pages/Profile';
import Transfer from './pages/Transfer';
function App() {
  const w3Context = useW3Context();
  const { isLoading, account, contract, error } = w3Context;

  if (isLoading || !account || !contract) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error}/>;
  }
  
  return (<BrowserRouter>
    <ResponsiveAppBar />
    <Routes>
      <Route path="/">
        <Route index element={<Home />}/>
        <Route path="/nfts/:tokenId" element={<NFTDetail />}/>
      </Route>
      <Route path="/profile/:account" element={<Profile />}/>
      <Route path='/create' element={<Create />}/>
      <Route path="/transfer/:tokenId" element={<Transfer _metadata={null}/>}/>
      <Route path="*" element={<NotFound />}/>
    </Routes>
  </BrowserRouter>);
}

export default App
