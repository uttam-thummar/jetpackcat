import { useState, useEffect } from 'react'
import { useWeb3Context } from '../hooks/web3'
import _whiteListedUsers from './WhiteList.json';
import Web3 from 'web3';
import NftJson from '../abis/Test.json';
import { Contract } from "web3-eth-contract"

const MintButton = () => {
    const {
        connect,
        disconnect,
        checkWrongNetwork,
        provider,
        connected,
        address,
        providerChainId
    } = useWeb3Context();

    const [isReadyToMint, setIsReadyToMint] = useState(false);
    const [isUserWhitelisted, setIsUserWhitelisted] = useState(false);
    const [WhiteListedUsers, setWhiteListedUsers] = useState(_whiteListedUsers);
    const [mainLoading, setMainLoading] = useState(false);
    const [numberMint, setNumberMint] = useState(2);
    const [noticeToShow, setNoticeToShow] = useState("Connect Wallet to Mint");
    const [nftContract, setNftContract] = useState<Contract>({} as Contract);
    const [isPresale, setIsPresale] = useState(false);
    const [isPublicSale, setIsPublicSale] = useState(false);
    const [totalMinted, setTotalMinted] = useState("");
    const [mintCost, setMintCost] = useState(0.05);

    const incrementNumber = () => {
        numberMint > 19 ? setNumberMint(numberMint) : setNumberMint(numberMint + 1);
    }
    const decrementNumber = () => {
        numberMint > 1 ? setNumberMint(numberMint - 1) : setNumberMint(numberMint);
    }

    useEffect(() => {
        loadWhiteListedUsers();
        if (connected) {
            loadData();
        }
    }, []);

    useEffect(() => {
        if (connected) {
            if (providerChainId === 3) {
                loadData();
            } else {
                checkWrongNetwork();
            }
        }
    }, [connected]);

    const loadData = async () => {
        setMainLoading(true);
        // @ts-ignore: Unreachable code error
        let web3 = new Web3(provider);
        const networkAddress = "0x3D9B296b24Fc749d392433eFFEb6FACf8BD9f308";
        const _nftContract = new web3.eth.Contract(
            // @ts-ignore: Unreachable code error
            NftJson.abi,
            networkAddress
        );
        setNftContract(_nftContract);

        const _isPresale = await _nftContract.methods.isPresale().call();
        setIsPresale(_isPresale);
        console.log('_isPresale', _isPresale)
        var _isPublicSale = false;
        if (!_isPresale) {
            _isPublicSale = await _nftContract.methods.isPublicSale().call();
            setIsPublicSale(_isPublicSale);
            console.log('_isPublicSale', _isPublicSale)
        }
        if (_isPresale) {
            const _mintPreSaleCost = await _nftContract.methods.PRESALE_PRICE().call();
            console.log('_mintPreSaleCost', _mintPreSaleCost)
            setMintCost(_mintPreSaleCost.toString());
            setNoticeToShow("Wallet Connected, Ready to Mint");
        } else if (_isPublicSale) {
            const _mintPublicSaleCost = await _nftContract.methods.PUBLIC_SALE_PRICE().call();
            console.log('_mintPublicSaleCost', _mintPublicSaleCost)
            setMintCost(_mintPublicSaleCost.toString());
            setNoticeToShow("Wallet Connected, Ready to Mint");
        } else {
            setNoticeToShow("...Not Yet...");
        }

        const _totalMinted = await _nftContract.methods.totalSupply().call();
        console.log('_totalMinted', _totalMinted)
        setTotalMinted(_totalMinted.toString());

        setIsUserWhitelisted(_isUserWhiteListed(address));
        setIsReadyToMint(true);
        setMainLoading(false);
    }
    const loadWhiteListedUsers = () => {
        setWhiteListedUsers(_whiteListedUsers);
    }
    const connectWallet = async () => {
        if (!connected) {
            setNoticeToShow("Connectung...");
            connect();
        }
    }
    const _isUserWhiteListed = (_address: string) => {
        for (let i = 0; i < WhiteListedUsers.length; i++) {
            if (WhiteListedUsers[i].toString().toUpperCase() === _address.toString().toUpperCase()) {
                return true;
            }
        }
        return false;
    }
    const flipPreSale = async () => {
        if (connected) {
            setMainLoading(true);
            try {
                await nftContract.methods.flipPreSale().send({ from: address });
                loadData();
            } catch (error) {
                console.log(error);
                loadData();
            }
        }
    }
    const flipPublicSale = async () => {
        if (connected) {
            setMainLoading(true);
            try {
                await nftContract.methods.flipPublicSale().send({ from: address });
                loadData();
            } catch (error) {
                console.log(error);
                loadData();
            }
        }
    }

    return (
        <>
            <div className="mintbox">
                <div className="section-title">
                    <img src="images/text/MINT.png" alt="" />
                </div>
                <div className="section-content">
                    <div className="befor-sc">
                        WHITELIST MINT: LIVE <br />
                        PUBLIC SALE: TBD
                    </div>
                    {isReadyToMint ? (
                        isUserWhitelisted ? (
                            <div id="mint" className="mint">
                                <a style={{ 'textDecoration': 'underline' }} onClick={disconnect}>
                                    <span>Disconnect</span>
                                </a>
                                <div className="row align-items-center">
                                    <div className="col-lg-4"></div>
                                    <div className="cw-mint">
                                        <div className="cw-mflex">
                                            {/*  <div className="number">
                    <span className="minus">-</span>
                    <input type="text" value="1" min="1" max="20"/>
                    <span className="plus">+</span>
                </div> */}

                                            <div className=" text-center d-flex justify-content-center">
                                                <div className="input-group-btn">
                                                    <button
                                                        id="down"
                                                        style={{ 'fontSize': '2rem' }}
                                                        className="btn"
                                                        onClick={decrementNumber}
                                                    >
                                                        -
                                                    </button>
                                                </div>
                                                <h3 className="btn"
                                                    style={{ 'fontSize': '2rem' }}
                                                >{numberMint}</h3>
                                                <div className="input-group-btn">
                                                    <button
                                                        id="up"
                                                        className="btn"
                                                        style={{ 'fontSize': '2rem' }}
                                                        onClick={incrementNumber}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-center mb-5">
                                                <button className="btn btn-primary " style={{ 'paddingLeft': '80px', 'paddingRight': '80px' }}>
                                                    MINT
                                                </button>
                                            </div>
                                        </div>
                                        <p className=" text-dark text-center">{noticeToShow}</p>
                                    </div>
                                </div>
                                <div className="cw-copy text-center">
                                    <p>
                                        <b>PRE-MINT: {totalMinted} / 7777</b>
                                    </p>
                                    <p>PRICE: {mintCost / 10 ** 18} ETH</p>
                                </div>
                            </div>
                        ) : (
                            <div id="mint" className="mint">
                                <div className="befor-button">
                                    <a className="btn btn-primary" onClick={disconnect}>
                                        <span>Disconnect</span>
                                    </a>
                                </div>
                                <div className="text-center">
                                    <h6>
                                        You are not whitelisted. So, Please try to mint nfts in
                                        public sale
                                    </h6>
                                </div>
                            </div>
                        )
                    ) : (
                        <div id="connect-wallet" className="connect-wallet">
                            <div className="row align-items-center">
                                <div className="col-lg-4"></div>
                                <div className="befor-button">
                                    <a className="btn btn-primary" onClick={connectWallet}>
                                        <span>Connect wallet</span>
                                    </a>
                                </div>
                                <div className="befor-btn-desc">
                                    <p>Please connect wallet to mint</p>
                                    <p>SUPPLY: 7777</p>
                                    <h4>PRE-MINT: 0.02e</h4>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <button onClick={flipPreSale}>Flip Presale</button>
                    <button onClick={flipPublicSale}>Flip Public Sale</button>
                </div>
            </div>
            <br />
            <br />
        </>
    )
}

export default MintButton
