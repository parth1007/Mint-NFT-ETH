import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import myEpicNft from './utils/MyEpicNFT.json';

const TWITTER_HANDLE = 'Parthsoni1007';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-acijcovjmc';
const TOTAL_MINT_COUNT = 30;
const CONTRACT_ADDRESS = "0xf4C80d2E0DFcA6A86a76cbc119EcFF3eBFf46Ca5";


const App = () => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [nftCount,setNftCount] = useState(0);
    const [isMinting,setIsMinting] = useState(false);
    
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;

      if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
      } else {
          console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
					setCurrentAccount(account)
          
          // Setup listener! This is for the case where a user comes to our site
          // and ALREADY had their wallet connected + authorized.
          setupEventListener()
      } else {
          console.log("No authorized account found")
      }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener() 

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        var cnt = await connectedContract.getTotalNFTsMintedSoFar();
        setNftCount(cnt);
        console.log(cnt);


        // Calls the event from .sol file and gives us the tokenId of NFT.
        // Called every time we make a txn.
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setNftCount(cnt);
          alert(`Hey there! We've minted your NFT and sent it to your wallet. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }



  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setIsMinting(true);

        console.log("Mining...please wait.")
        await nftTxn.wait();

        // Toggle loader animation
        setIsMinting(false);

        console.log(nftTxn);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        var cnt = await connectedContract.getTotalNFTsMintedSoFar();
        setNftCount(cnt);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])



  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" && 
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
              Connect to Wallet
            </button>
          }

          {currentAccount !== "" &&
          <>
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
              </button>
              
              <br/><br/>
              {isMinting && 
                <div class="spinner-border text-light" role="status" style={{height:"3rem",width:"3rem",marginTop:"2rem"}}>
                  <span class="visually-hidden">Loading...</span>
                </div>
              }
              <h3 style={{color: "white",marginTop:"3rem"}}>{`${nftCount} / ${TOTAL_MINT_COUNT} NFT Minted`}</h3>

              <a href={OPENSEA_LINK} target="_blank" rel="noopener noreferrer" style={{cursor:"pointer"}}>
                <button  className="cta-button connect-wallet-button">
                  NFT Collection
                </button>
              </a>
              <br/><br/><br/>
              
            </>
          }
          
        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a className="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer">{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;