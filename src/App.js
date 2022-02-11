import * as React from "react";
import { ethers, providers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [message, setMessage] = React.useState();
  const [allWaves, setAllWaves] = React.useState([]);
  const contractAddress = "0xbC8958d9f9edEeE8D5CF26D8a5ac9549f2A984Ae";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found the authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {}
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {}
  };
  React.useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWave();
        console.log("Retreive total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);

        count = await wavePortalContract.getTotalWave();
        console.log("Retreived total wave count...", count.toNumber());
      } else {
        console.log("Ehtereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    let wavePortalContract;
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };
  return (
    <React.Fragment>
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">👋 Hey there!</div>

          <div className="bio">
            I am Abhishek and I am a React Native Developer! Now shifting my
            learning curve towards Ethereum and Solidity. Connect your Ethereum
            wallet and wave at me!
          </div>
          <form>
            <textarea
              style={{
                width: "400px",
                height: "300px",
                marginTop: "20px",
                fontSize: "18px",
                borderWidth: "5px",
                borderColor: "#d19c08",
                borderRadius: "5px",
                padding: "10px",
              }}
              placeholder="Enter your beautiful message here :)"
              type="text"
              value={message}
              onChange={handleChange}
            />
          </form>
          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect to wallet
            </button>
          )}
          <button
            className="waveButton"
            style={{ marginBottom: "50px" }}
            onClick={getAllWaves}
          >
            Get History of All Waves
          </button>
        </div>
      </div>
      {allWaves.map((wave, index) => {
        return (
          <div className="history">
            <div key={index}>
              <div style={{ marginBottom: "10px" }}>
                Address: {wave.address}
              </div>
              <div style={{ marginBottom: "10px" }}>
                Time: {wave.timestamp.toString()}
              </div>
              <div style={{ marginBottom: "10px" }}>
                Message: {wave.message}
              </div>
            </div>
          </div>
        );
      })}
    </React.Fragment>
  );
}
