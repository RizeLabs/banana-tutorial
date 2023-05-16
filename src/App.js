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
    const jsonRpcMumbaiUrl = 'https://polygon-mumbai.g.alchemy.com/v2/cNkdRWeB8oylSQJSA2V3Xev2PYh5YGr4'
    const bananaInstance = new Banana(Chains.mumbai, jsonRpcMumbaiUrl);
    setBananSdkInstance(bananaInstance)
  }

  const createWallet = async () => {
    if(walletName === "") {
      alert("Wallet name can't be empty!!")
      return;
    }
    setIsLoading(true);
    const isWalletNameUnqiue = await bananaSdkInstance.isWalletNameUnique(walletName);
    if(!isWalletNameUnqiue) {
      alert("Wallet name provided is not unique");
      setIsLoading(false);
      return
    }
    const walletAddres = (await bananaSdkInstance.createWallet(walletName)).address
    console.log(walletAddres);
    setWalletAddress(walletAddres)
    setIsLoading(false);
  }

  const connectWallet = async () => {
    const walletName = bananaSdkInstance.getWalletName();
    if(walletName) {
      setIsLoading(true)
      const walletAddress = (await bananaSdkInstance.connectWallet(walletName)).address
      setWalletAddress(walletAddress)
      setIsLoading(false);
    } else {
      setIsLoading(false);
      alert("You don't have wallet created!");
    }
  }

  const makeTransaction = async () => {

    let bananaProvider = await bananaSdkInstance.getBananaProvider();
    let bananaSigner = bananaProvider.getSigner();
    const greeterAddress = "0x454d3A39dFf28E15b82DE77122e3b0beb461CF22";

    let greeterContract = new ethers.Contract(
      greeterAddress,
      GreeterArtifact.abi,
      bananaSigner
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
    const sampleMsg = "Hello World"; 
    const eoaAddress = await bananaSdkInstance.getEOAAddress();
    const signMessageResponse = await bananaSdkInstance.signMessage(sampleMsg);
    const messageSigned = signMessageResponse.messageSigned;
    const signature = signMessageResponse.signature;
    console.log(messageSigned, signature, eoaAddress);
    const isVerified = await bananaSdkInstance.verifySignature(signature, messageSigned, eoaAddress);
    console.log(isVerified);
    setIsLoading(false)
  }

  const test = async () => {

    const jsonRpcProviderUrl = 'https://rpc.ankr.com/eth_goerli'
    const bananaInstanceTemp = new Banana(Chains.goerli, jsonRpcProviderUrl);

    console.log('bananaInstanceTemp', bananaInstanceTemp)

    await bananaInstanceTemp.resetWallet();

    const walletNameTemp = 'test-asluddfdfh87234szabc';
    try {
      await bananaInstanceTemp.connectWallet(walletNameTemp)
    } catch (err) {
      console.log(err)
    }

    console.log('walletNameTemp', walletNameTemp)

    const isWalletNameUniqueTemp = await bananaInstanceTemp.isWalletNameUnique(walletNameTemp)
    console.log('isWalletNameUniqueTemp', isWalletNameUniqueTemp)

    const walletAddressTemp = await bananaInstanceTemp.getEOAAddress(walletNameTemp)
    console.log('walletAddressTemp', walletAddressTemp)

    const bananaProvider = await bananaInstanceTemp.getBananaProvider()
    console.log('bananaProvider', bananaProvider)
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
      <button className='btn'onClick={() => test()}  > test </button>
    </div>
  );
}

export default App;
