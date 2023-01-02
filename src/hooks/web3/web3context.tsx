import React, { useState, createContext, useContext, useMemo, useCallback } from 'react';
import { JsonRpcProvider, StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import Web3Modal from 'web3modal';
import { DEFAULT_NETWORK, messages } from '../../constants';
import WalletConnectProvider from '@walletconnect/web3-provider';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { getTestnetUri, switchNetwork } from './helpers';

const INFURA_ID = "2caa7f4b2637414fadb0e234ce86eec3";

type onChainProvider = {
    connect: () => Promise<Web3Provider>
    disconnect: () => void
    checkWrongNetwork: () => Promise<boolean>
    provider: JsonRpcProvider
    web3Modal: Web3Modal
    address: string
    hasCachedProvider: () => boolean;
    connected: boolean
    providerChainId: number
    chainID: number
}

type Web3ContextProviderProps = {
    children: React.ReactNode
}

export type Web3ContextData = {
    onChainProvider: onChainProvider
} | null;

export const Web3context = createContext<Web3ContextData>(null);

export const useWeb3Context = () => {
    const web3context = useContext(Web3context)
    if(!web3context){
        throw new Error("useWeb3Context() can only be used inside of <Web3ContextProvider />, " + "please declare it at a higher level.");
    }
    const { onChainProvider } = web3context;
    return useMemo(() => {
        return {...onChainProvider};
    }, [web3context]);
}
export const useAddress = () => {
    const { address } = useWeb3Context();
    return address;
}

export const Web3ContextProvider = ({ children }: Web3ContextProviderProps) => {

    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState("");
    const [chainID, setChainID] = useState(DEFAULT_NETWORK);
    const [providerChainId, setProviderChainId] = useState(DEFAULT_NETWORK);
    const [uri, setUri] = useState(getTestnetUri());
    const [provider, setProvider] = useState<JsonRpcProvider>(new StaticJsonRpcProvider(uri));

    const [web3Modal] = useState(new Web3Modal({
        network: "ropsten", // optional
        cacheProvider: true, // optional
        providerOptions: {
            walletconnect: {
                package: WalletConnectProvider, // required
                options: {
                    infuraId: INFURA_ID // required
                }
            },
            coinbasewallet: {
                package: CoinbaseWalletSDK, // Required
                options: {
                    appName: "JetPackCat", // Required
                    infuraId: INFURA_ID, // Required
                    //rpc: "", // Optional if `infuraId` is provided; otherwise it's required
                    chainId: 3, // Optional. It defaults to 1 if not provided
                    darkMode: false // Optional. Use dark theme, defaults to false
                }
            }
        } // required
    }));

    const hasCachedProvider = (): boolean => {
        if (!web3Modal) return false;
        if (!web3Modal.cachedProvider) return false;
        return true;
    }

    const _initialListners = useCallback((rawProvider: JsonRpcProvider) => {
        if (!rawProvider.on) return;

        rawProvider.on("accountsChanged", () => {
            setTimeout(() => {
                window.location.reload();
            }, 1)
        });
        rawProvider.on("chainChanged", async (chain: number) => {
            changeNetwork(chain);
        });
        rawProvider.on("network", (newNetwork, oldNetwork) => {
            if (!oldNetwork) return;
            window.location.reload();
        })
    }, [provider]);

    const changeNetwork = async (changedChainId: number) => {
        const network = changedChainId;
        setProviderChainId(network);
    }

    const connect = useCallback(async () => {
        const rawProvider = await web3Modal.connect();
        setProvider(rawProvider);

        _initialListners(rawProvider);

        const connectedProvider = new Web3Provider(rawProvider, "any");
        const chainId = await connectedProvider.getNetwork().then((network) => Number(network.chainId));
        const connectedAddress = await connectedProvider.getSigner().getAddress();
        setAddress(connectedAddress);
        setProviderChainId(chainId);
        checkWrongNetwork();
        setConnected(true);
        return connectedProvider;
    }, [provider, web3Modal, connected]);

    const disconnect = useCallback(async () => {
        if(window.confirm("Are you sure you want to Disconnect")){
            web3Modal.clearCachedProvider();
            setConnected(false);
            setTimeout(() => {
                window.location.reload();
            }, 1)
        }
    }, [connected, provider, web3Modal]);

    const checkWrongNetwork = async (): Promise<boolean> => {
        if (providerChainId !== DEFAULT_NETWORK) {
            const shouldSwitch = window.confirm(messages.switch_to_ethereum)
            if(shouldSwitch){
                await switchNetwork();
                window.location.reload();
            }
            return true;
        }
        return false;
    }

    const onChainProvider = useMemo(
        () => ({
            connect,
            disconnect,
            checkWrongNetwork,
            provider,
            web3Modal,
            connected,
            address,
            hasCachedProvider,
            providerChainId,
            chainID
        }),
        [connect, disconnect, provider, web3Modal, connected, address, hasCachedProvider, providerChainId, chainID]
    )
    return (
        <Web3context.Provider value={{onChainProvider}}>
            {children}
        </Web3context.Provider>
    )
}
