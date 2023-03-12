import './App.css';
import { Banana } from '@rize-labs/banana-wallet-sdk/dist/BananaProvider'
import { Chains } from '@rize-labs/banana-wallet-sdk/dist/Constants';
import { useEffect, useState } from 'react';
import GreeterArtifact from './Greeter.json'
import { ethers } from 'ethers';

function App() {

  useEffect(() => {
    getBananaInstance();
  }, []);

  const [walletName, setWalletName] = useState('');
  const [walletAddress, setWalletAddress] = useState('')
  const [bananaSdkInstance, setBananSdkInstance] = useState(null);
  const [signedMessage, setSignedMessage] = useState('')
  const [signature, setSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageTobeSigned, setMessageTobeSigned] = useState('');

  const getBananaInstance = () => {
    const jsonRpcMumbaiUrl = 'https://polygon-mumbai.g.alchemy.com/v2/{ALCHEMY_POLYGON_MUMBAI_RPC_TOKEN}'
    const bananaInstance = new Banana(Chains.mumbai, jsonRpcMumbaiUrl);
    setBananSdkInstance(bananaInstance)
  }

  const createWallet = async () => {
    if(walletName === "") {
      alert("Wallet name can't be empty!!")
      return;
    }
    setIsLoading(true);
    const walletAddres = await bananaSdkInstance.getWalletAddress(walletName);
    console.log(walletAddres);
    setWalletAddress(walletAddres)
    setIsLoading(false);
  }

  const connectWallet = async () => {
    const walletName = bananaSdkInstance.getWalletName();
    if(walletName) {
      setIsLoading(true)
      const walletAddress = await bananaSdkInstance.getWalletAddress(walletName)
      setWalletAddress(walletAddress)
      setIsLoading(false);
    } else {
      setIsLoading(false);
      alert("You don't have wallet created!");
    }
  }

  const makeTransaction = async () => {

    let aaProvider = await bananaSdkInstance.getAAProvider();
    let aaSigner = aaProvider.getSigner();
    const greeterAddress = "0x454d3A39dFf28E15b82DE77122e3b0beb461CF22";

    let greeterContract = new ethers.Contract(
      greeterAddress,
      GreeterArtifact.abi,
      aaSigner
    );

    const updateValueCallData = greeterContract.interface.encodeFunctionData("updateValue", ["10"]);
    try {
      setIsLoading(true);
        const txn = await bananaSdkInstance.execute(
            updateValueCallData,
            greeterAddress,
            "0"
        );    
    } catch (err) {
      setIsLoading(false);
        console.log(err);
    }
    setIsLoading(false);
  }

  const signMessage = async () => {
    setIsLoading(true)
    const response = await bananaSdkInstance.signMessage(messageTobeSigned, true);
    setSignedMessage(response.signedMessage)
    setSignature(response.signature);
    setIsLoading(false)
  }

  return (
    <div className="App">
      {isLoading && <p> Loading...</p>}
      <input className='input' type="text" placeholder="Enter wallet name" onChange={(e) => setWalletName(e.target.value)}></input> 
      {walletAddress && <p> Wallet Address: {walletAddress}</p>}
      <button className='btn' onClick={() => createWallet()}> Create Wallet </button> <br />
      <button className='btn' onClick={() => connectWallet()}> Connect Wallet </button> <br />
      <button className='btn' onClick={() => makeTransaction()}> Make transaction  </button> <br />
      <input className='input' type="text" placeholder="Enter message to be signed" onChange={(e) => setMessageTobeSigned(e.target.value)}></input> <br />
      <button className='btn' onClick={() => signMessage()}> Sign message  </button>
      {signedMessage && <p>Signed message: {signedMessage} </p>}
      {signature && <p> Signature: {signature} </p>}
    </div>
  );
}

export default App;
