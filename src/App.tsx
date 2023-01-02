import './App.css';
import MintButton from './components/MintButton';
import { Web3ContextProvider } from './hooks/web3';

function App() {
  return (
    <Web3ContextProvider>
      <div>
        <MintButton />
      </div>
    </Web3ContextProvider>
  );
}

export default App;
