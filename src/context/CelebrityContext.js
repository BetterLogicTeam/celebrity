import { ethers, Contract, BigNumber } from "ethers";
import { createContext, useEffect, useState } from "react";
// import 'dotenv/config';
import { v4 as uuidv4 } from "uuid";
import abi from "../utils/nftAbi.json"

import axios from "axios";
import swal from "sweetalert";
import {
  // DSLtokenABITestnet,
  // DSLtokenAddressTestnet,
  mintABITestnet,
  mintAddressTestnet,
  // USDSCtokenABITestnet,
  // USDSCtokenAddressTestnet,
  USDSCtokenAddressMainnet,
  USDSCtokenABIMainnet,
  DSLtokenAddressMainnet,
  DSLtokenABIMainnet,
  // S39tokenAddressTestnet,
  // S39tokenABITestnet,
  // QuesttokenAddressTestnet,
  // QuesttokenABITestnet,
  private_key,
  RPC,
  chainId
} from "../utils/constant";
export const CelebrityContext = createContext();

const { ethereum } = window;

const getMintContractTestnet = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const MintNFTContract = new ethers.Contract(
    mintAddressTestnet,
    mintABITestnet,
    signer
  );

  console.log("MintNFTContract", MintNFTContract)

  return MintNFTContract;
};



const getUSDSCtokenContractMainnet = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const tokenContract = new ethers.Contract(
    USDSCtokenAddressMainnet,
    USDSCtokenABIMainnet,
    signer
  );

  return tokenContract;
};

const getDSLtokenContractMainnet = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const tokenContract = new ethers.Contract(
    DSLtokenAddressMainnet,
    DSLtokenABIMainnet,
    signer
  );

  return tokenContract;
};



const getAllItemBlockchain = async () => {
  const provider = new ethers.providers.JsonRpcProvider(RPC);
  return {
    provider,
    deployer: new ethers.Wallet(private_key, provider),
    NFTContract: new Contract(mintAddressTestnet, abi, provider)
  };
};

const genSignature = async (types, voucher, auth) => {
  const domain = {
    name: "NFT-Voucher",
    version: "1",
    verifyingContract: auth.contract,
    chainId: chainId
  };
  const BuyNFTVoucher = {
    id: voucher.id,
    price: voucher.price,
    tokenAddress: voucher.tokenAddress,
    nonce: voucher.nonce
  };

  const signature = await auth.signer._signTypedData(domain, types, BuyNFTVoucher);

  return {
    ...voucher,
    signature,
  };
};

const signBuyFunction = async (id, price, tokenAddress, refAddress, uri) => {

  const contracts = await getAllItemBlockchain();
  const auth = {
    signer: contracts.deployer,
    contract: contracts.NFTContract.address,
  };

  const types = {
    BuyNFTStruct: [
      { name: "id", type: "string" },
      { name: "price", type: "uint256" },
      { name: "tokenAddress", type: "address" },
      { name: "nonce", type: "string" },
    ],
  };
  console.log('111111111111111: ', id, price, tokenAddress, refAddress, uri)

  // Generate nonce as transaction id
  const nonce = uuidv4();
  const voucher = {
    id: id,
    price: BigNumber.from(price),
    tokenAddress: tokenAddress,
    refAddress: refAddress.length !== 0 ? refAddress : "0x0000000000000000000000000000000000000000",
    nonce: nonce,
    uri: uri,
  };
  return {
    ...(await genSignature(types, voucher, auth)),
    price: price.toString(),
  };
}


export default function CelebrityProvider({ children }) {
  const [loginModal, setLoginModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [chain, setChain] = useState(null);
  const [walletModal, setWalletModal] = useState(false);
  const [metamaskBalance, setMetamaskBalance] = useState({});
  const [metamaskBalanceLoading, setMetamaskBalanceLoading] = useState(false);
  const [coinbaseModal, setCoinbaseModal] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const openWalletModal = () => {
    (!user?.walletAddress || user?.walletAddress === "undefined") &&
      setWalletModal(true);
  };
  const closeWalletModal = () => setWalletModal(false);

  const openCoinbaseModal = () => {
    // (!user?.walletAddress || user?.walletAddress === "undefined") &&
    setCoinbaseModal(true);
  };
  const closeCoinbaseModal = () => setCoinbaseModal(false);

  const openLoginModal = () => setLoginModal(true);
  const closeLoginModal = () => setLoginModal(false);

  useEffect(() => {
    checkIfWalletIsConnect();
  }, []);




  const getBalanceMainnet = async () => {
    const USDSCtokenContract = getUSDSCtokenContractMainnet();
    const DSLtokenContract = getDSLtokenContractMainnet();
    const USDSCbalance = await USDSCtokenContract.balanceOf(currentAccount);
    const USDSCamount = ethers.utils.formatEther(USDSCbalance);
    const DSLbalance = await DSLtokenContract.balanceOf(currentAccount);
    const DSLamount = ethers.utils.formatEther(DSLbalance);
    const provider = new ethers.providers.Web3Provider(ethereum);
    const balance1 = await provider.getBalance(currentAccount);
    const metamask = {
      usdsc: USDSCamount,
      bnb: ethers.utils.formatEther(balance1),
      dsl: DSLamount,
    };
    return setMetamaskBalance(metamask);
  };

  const mintTicketNFTTestnetBNB = async (data) => {
    console.log('what is recieve data', data)
    try {
      if (ethereum) {
        const chainid = await window.ethereum.request({
          method: "eth_chainId",
        });

        console.log("This is Chain ID: ", chainid);
        if (chainid === "0x38") {
          const MintNFTContract = getMintContractTestnet();
          console.log(MintNFTContract);
          const provider = new ethers.providers.Web3Provider(ethereum);


          // const parsedAmount = ethers.utils.parseEther(mintPrice);
          const admin = "0x626D20125da6a371aA48023bF9dad94BD66588F7";
          // const payment = await MintNFTContract.charge(admin, {
          //   value: parsedAmount._hex,
          // });
          // let payment_test = await provider.getTransaction(payment.hash);
          // while (payment_test.blockNumber === null) {
          //   console.log("Payment In Progress...");
          //   payment_test = await provider.getTransaction(payment.hash);
          // }
          // console.log(payment_test.blockNumber);
          // let payment_hash = "https://testnet.bscscan.com/tx/" + payment.hash;
          // console.log("Payment link: " + payment_hash);
          // const recipient = currentAccount;
          // console.log(currentAccount);
          // const Val = await MintNFTContract.mint(uriNft, recipient);

          // const object = {
          //   id: data.id,
          //   price: data.price,
          //   tokenAddress: data.tokenAddress,
          //   refAddress: data.refAddress,
          //   nonce: data.nonce,
          //   uri: data.uri,
          //   signature: data.signature
          // }
          const object = {
            id: data.nftid,
            price: data.price,
            tokenAddress: data.tokenAddress,
            refAddress: data.refadress,
            nonce: data.nonce,
            uri: "OpenZeppelin Contracts v4.4.1 (token/ERC721/extensions/IERC721Metadata.sol)",
            signature: data.signature
          }
          // const Val = await MintNFTContract.buyNFT(object, { value: BigNumber.from(object.price) })

          const Val = await MintNFTContract.buyNFT(object, { value: data })
          alert(Val)
          await Val.wait()
          let txn_test = await provider.getTransaction(Val.hash);
          while (txn_test.blockNumber === null) {
            console.log("Minting...");
            txn_test = await provider.getTransaction(Val.hash);
          }
          console.log("txn_test.blockNumber: " + txn_test.blockNumber);
          let mint_hash = "https://bscscan.com/tx/" + Val.hash;
          console.log("Mint link: " + mint_hash);
          const ID = await MintNFTContract.totalSupply();
          console.log("Token ID: ", ID.toString());
          console.log("this is Token ID: 10000" + ID.toString());
          console.log("this is Contract Address: : " + mintAddressTestnet);

          let details = { mint: mint_hash, Id: ID };
          console.log(details);

          return {
            mint_hash: mint_hash,
            ID: "10000" + ID.toString(),
            mintPrice: data.price,
            address: "0x0000000000000000000000000000000000000000",
          };

        } else {
          console.log("No ethereum object");
        }
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const mintTicketNFTTestnetUSDSC = async (data) => {
    try {
      if (ethereum) {
        const MintNFTContract = getMintContractTestnet();
        const USDSCTokenContract = getUSDSCtokenContractMainnet();
        console.log(USDSCTokenContract);
        const provider = new ethers.providers.Web3Provider(ethereum);
        // const parsedAmount = ethers.utils.parseEther(data.price);
        // const admin = "0x626D20125da6a371aA48023bF9dad94BD66588F7";
        // const gasLimit = await USDSCTokenContract.estimateGas.approve(
        //   MintNFTContract.address,
        //   ethers.constants.MaxUint256
        // );
        // const gasPrice = await await provider.getGasPrice();
        console.log("USDC", MintNFTContract.address,
          BigNumber.from(ethers.constants.MaxUint256))
        const payment = await USDSCTokenContract.approve(
          MintNFTContract.address,
          BigNumber.from(ethers.constants.MaxUint256)
        );
        let payment_test = await provider.getTransaction(payment.hash);
        while (payment_test.blockNumber === null) {
          console.log("Approve In Progress...");
          payment_test = await provider.getTransaction(payment.hash);
        }
        console.log(payment_test.blockNumber);
        let payment_hash = "https://bscscan.com/tx/" + payment.hash;
        console.log("Payment link: " + payment_hash);
        // const recipient = currentAccount;
        // // const Val = await MintNFTContract.mint(uriNft, recipient);
        const object = {
          id: data.id,
          price: data.price,
          tokenAddress: data.tokenAddress,
          refAddress: data.refAddress,
          nonce: data.nonce,
          uri: data.uri,
          signature: data.signature
        }
        console.log("valueeee", object)

        const Val = await MintNFTContract.buyNFT(object)
        await Val.wait()
        let txn_test = await provider.getTransaction(Val.hash);
        if (txn_test) {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = `<p></p><div class="loaders"></div> <p class="wait"><b>Transaction Pending...<b></p> `;
          swal({
            content: wrapper,
            button: false,
            className: "modal_class_success",
          });
          while (txn_test.blockNumber === null) {
            console.log("Minting...");
            txn_test = await provider.getTransaction(Val.hash);
          }
          console.log("txn_test.blockNumber: " + txn_test.blockNumber);
        }
        const ID = await MintNFTContract.totalSupply();
        console.log(ID.toString());
        let mint_hash = "https://bscscan.com/tx/" + Val.hash;
        console.log("Mint link: " + mint_hash);

        return {
          mint_hash: mint_hash,
          ID: "10000" + ID.toString(),
          mintPrice: data.price,
        };

      }
    } catch (error) {
      console.log(error);
      console.log("No ethereum object");
      //setRequestLoading(false);
      if (error.code === -32603) {
        swal({
          title: "Attention",
          text: "Insufficient funds for minting!",
          icon: "warning",
          button: "OK",
          // dangerMode: true,
          className: "modal_class_success",
        });
      } else {
        swal({
          title: "Attention",
          text: "Minting Failed",
          icon: "warning",
          button: "OK",
          // dangerMode: true,
          className: "modal_class_success",
        });
      }
      throw new Error("No ethereum object");
    }
  };

  const mintTicketNFTTestnetDSL = async (data) => {
    try {
      if (ethereum) {
        const MintNFTContract = getMintContractTestnet();
        const USDSCTokenContract = getDSLtokenContractMainnet();
        const provider = new ethers.providers.Web3Provider(ethereum);
        // const parsedAmount = ethers.utils.parseEther(mintPrice);
        // const admin = "0x626D20125da6a371aA48023bF9dad94BD66588F7";
        // const gasLimit = await USDSCTokenContract.estimateGas.transfer(
        //   admin,
        //   parsedAmount._hex
        // );
        // const gasPrice = await await provider.getGasPrice();
        console.log("USDC", MintNFTContract.address,
          BigNumber.from(ethers.constants.MaxUint256))
        const payment = await USDSCTokenContract.approve(
          MintNFTContract.address,
          BigNumber.from(ethers.constants.MaxUint256)
        );
        let payment_test = await provider.getTransaction(payment.hash);
        while (payment_test.blockNumber === null) {
          console.log("Approve In Progress...");
          payment_test = await provider.getTransaction(payment.hash);
        }
        console.log(payment_test.blockNumber);
        let payment_hash = "https://bscscan.com/tx/" + payment.hash;
        console.log("Payment link: " + payment_hash);
        // const recipient = currentAccount;
        // const Val = await MintNFTContract.mint(uriNft, recipient);
        const object = {
          id: data.id,
          price: data.price,
          tokenAddress: data.tokenAddress,
          refAddress: data.refAddress,
          nonce: data.nonce,
          uri: data.uri,
          signature: data.signature
        }
        console.log("valueeee", object)

        const Val = await MintNFTContract.buyNFT(object)
        await Val.wait()
        let txn_test = await provider.getTransaction(Val.hash);
        if (txn_test) {
          while (txn_test.blockNumber === null) {
            console.log("Minting...");
            txn_test = await provider.getTransaction(Val.hash);
          }
          console.log("txn_test.blockNumber: " + txn_test.blockNumber);
        }
        const ID = await MintNFTContract.totalSupply();
        console.log(ID.toString());
        let mint_hash = "https://bscscan.com/tx/" + Val.hash;
        console.log("Mint link: " + mint_hash);
        return {
          mint_hash: mint_hash,
          ID: "10000" + ID.toString(),
          mintPrice: data.price,
        };
      }
    } catch (error) {
      console.log(error);
      console.log("No ethereum object");
      //setRequestLoading(false);
      if (error.code === -32603) {
        swal({
          title: "Attention",
          text: "Insufficient funds for minting!",
          icon: "warning",
          button: "OK",
          // dangerMode: true,
          className: "modal_class_success",
        });
      } else {
        swal({
          title: "Attention",
          text: "Minting Failed",
          icon: "warning",
          button: "OK",
          // dangerMode: true,
          className: "modal_class_success",
        });
      }
      throw new Error("No ethereum object");
    }
  };




  // useEffect(() => {
  //     if (currentAccount && localStorage.getItem("token")) {
  //         setLoading(true);
  //         axios.get(`https://backend.grighund.net/api/users/${currentAccount}`, {
  //             headers: {
  //                 "authorization": `Bearer ${localStorage.getItem("token")}`
  //             }
  //         })
  //             .then(res => {
  //                 setUser(res.data);
  //             })
  //             .catch(err => {
  //                 console.log(err);
  //             })
  //             .finally(() => {
  //                 setLoading(false);
  //             });
  //     }
  // }, [currentAccount]);

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) {
        return console.log("please use metamask");
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        const chainid = await window.ethereum.request({
          method: "eth_chainId",
        });
        setChain(chainid);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async (wallet) => {
    try {
      console.log("connect");
      if (window.innerWidth < 576 && !ethereum) {
        return swal({
          title: "Attention",
          text: "Please use Metamask browser!",
          icon: "warning",
          button: "OK",
          dangerMode: true,
          className: "modal_class",
        });
      }
      if (!ethereum) {
        return console.log("please use metamask");
      }
      if (wallet === "Metamask") {
        setLoading(true);

        const chainid = await window.ethereum.request({
          method: "eth_chainId",
        });
        console.log("This is Chain ID: ", chainid);
        setChain(chainid);
        if (chainid === "0x38" || chainid === "0x61") {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
          setCurrentAccount(accounts[0]);

          await axios
            .post(`https://backendpub.celebrity.sg/api/v1/user/`, {
              walletAddress: accounts[0],
            })
            .then((res) => {
              if (res.data.user) {
                getBalanceMainnet();
                setUser(res.data.user);
                setLoading(false);
                closeWalletModal();
                localStorage.setItem("token", res.data.token);
                const wrapper = document.createElement("div");
                wrapper.innerHTML = `<p class='text-break text-white fs-6'>You have succesfully logged in with <br/>Binance Chain.</p>`;
                return swal({
                  title: "Success",
                  // text: "You have succesfully logged in with Binance Chain.",
                  content: wrapper,
                  icon: "success",
                  button: "OK",
                  // dangerMode: true,
                  className: "modal_class_success",
                });
              }
            });
        } else {
          swal({
            title: "Attention",
            text: "Please change to Binance Chain before connecting.",
            icon: "warning",
            button: "OK",
            dangerMode: true,
            className: "modal_class",
          });
        }
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const connectToCoinbase = async () => {
    getBalanceMainnet();

    if (typeof window.ethereum === "undefined") {
      // ask the user to install the extension
      return swal({
        title: "Attention",
        text: "Please open this website with wallet browsers",
        icon: "warning",
        button: "OK",
        dangerMode: true,
        className: "modal_class",
      });
    }
    let provider = window.ethereum;
    // edge case if MM and CBW are both installed
    if (window.ethereum.providers?.length) {
      window.ethereum.providers.forEach(async (p) => {
        if (p.isCoinbaseWallet) provider = p;
      });
    }
    const chainid = await provider.request({
      method: "eth_chainId",
    });
    console.log("This is Chain ID: ", chainid);
    setChain(chainid);
    if (chainid === "0x38") {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts[0]);
      setCurrentAccount(accounts[0]);

      await axios
        .post(`https://backendpub.celebrity.sg/api/v1/user/`, {
          walletAddress: accounts[0],
        })
        .then((res) => {
          if (res.data.user) {
            getBalanceMainnet();
            setUser(res.data.user);
            setLoading(false);
            closeCoinbaseModal();
            localStorage.setItem("tokenDsl", res.data.token);
            const wrapper = document.createElement("div");
            wrapper.innerHTML = `<p class='text-break text-white fs-6'>You have succesfully logged in with <br/>Coin Base.</p>`;
            return swal({
              title: "Success",
              content: wrapper,
              icon: "success",
              button: "OK",
              className: "modal_class_success",
            });
          }
        });
    } else {
      console.log("Please Switch to Binance Chain");
      swal({
        title: "Attention",
        text: "Please change to Binance Chain (Mainnet) before connecting.",
        icon: "warning",
        button: "OK",
        dangerMode: true,
        className: "modal_class",
      });
    }
  };

  const connectToMetamask = async () => {
    getBalanceMainnet();
    if (typeof window.ethereum === "undefined") {
      // ask the user to install the extension
      return swal({
        title: "Attention",
        text: "Please open this website with wallet browsers",
        icon: "warning",
        button: "OK",
        dangerMode: true,
        className: "modal_class",
      });
    }
    let provider = null;
    if (typeof window.ethereum !== "undefined") {
      let provider = window.ethereum;
      // edge case if MM and CBW are both installed
      if (window.ethereum.providers?.length) {
        window.ethereum.providers.forEach(async (p) => {
          if (p.isMetaMask) provider = p;
        });
      }
      try {
        const chainid = await provider.request({
          method: "eth_chainId",
        });
        setChain(chainid);
        if (chainid === "0x38") {
          const accounts = await provider.request({
            method: "eth_requestAccounts",
          });
          setCurrentAccount(accounts[0]);

          await axios
            .post(`https://backendpub.celebrity.sg/api/v1/user/`, {
              walletAddress: accounts[0],
            })
            .then((res) => {
              if (res.data.user) {
                setUser(res.data.user);
                getBalanceMainnet();

                setLoading(false);
                closeWalletModal();
                localStorage.setItem("tokenDsl", res.data.token);
                const wrapper = document.createElement("div");
                wrapper.innerHTML = `<p class='text-break text-white fs-6'>You have succesfully logged in with <br/>Binance Chain.</p>`;
                return swal({
                  title: "Success",
                  // text: "You have succesfully logged in with Binance Chain.",
                  content: wrapper,
                  icon: "success",
                  button: "OK",
                  // dangerMode: true,
                  className: "modal_class_success",
                });
              }
            });
        } else {
          console.log("Please Switch to Binance Chain");
          swal({
            title: "Attention",
            text: "Please change to Binance Chain (Mainnet) before connecting.",
            icon: "warning",
            button: "OK",
            dangerMode: true,
            className: "modal_class",
          });
        }
      } catch (error) {
        throw new Error("User Rejected");
      }
    } else {
      throw new Error("No MetaMask Wallet found");
    }
    console.log("MetaMask provider", provider);
    return provider;
  };

  const searchNftTitle = (isMeal, searchInput) => {
    const matchedNfts = isMeal.filter((element) =>
      element.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    if (matchedNfts.length > 0 && !searchInput == " ") {
      setSearchResults(matchedNfts);
    } else {
      setSearchResults("notFound");
    };
  }

  const logOut = async () => {
    setCurrentAccount(null);
    setUser({});
    localStorage.removeItem("token");
  };

  useEffect(() => {
    if (currentAccount && localStorage.getItem("token")) {
      setLoading(true);
      axios
        .get(`https://backendpub.celebrity.sg/api/v1/user/`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentAccount]);

  useEffect(() => {
    if (requestLoading) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `<p></p><div class="loaders"></div> <p class="wait"><b>Please wait, don't exit the screen.<b></p> `;
      swal({
        content: wrapper,
        button: false,
        className: "modal_class_success",
      });
    }
  }, [requestLoading]);

  return (
    <CelebrityContext.Provider
      value={{
        loginModal,
        openLoginModal,
        requestLoading,
        closeLoginModal,
        connectWallet,
        currentAccount,
        loading,
        user,
        walletModal,
        openWalletModal,
        closeWalletModal,
        setUser,
        chain,
        setRequestLoading,
        logOut,
        mintTicketNFTTestnetBNB,
        mintTicketNFTTestnetUSDSC,
        mintTicketNFTTestnetDSL,
        metamaskBalance,
        metamaskBalanceLoading,
        setMetamaskBalanceLoading,
        getBalanceMainnet,
        connectToMetamask,
        connectToCoinbase,
        coinbaseModal,
        openCoinbaseModal,
        closeCoinbaseModal,
        mintAddressTestnet,
        signBuyFunction,
        searchNftTitle,
        setSearchResults,
        searchResults
      }}
    >
      {children}
    </CelebrityContext.Provider>
  );
}
