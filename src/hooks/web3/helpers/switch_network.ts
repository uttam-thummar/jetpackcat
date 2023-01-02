export const switchNetwork = async () => {
    if(window.ethereum){
        try {
            await switchRequest();
        } catch (error: any) {
            if(error.code === 4902){
                try {
                    await addSwitchRequest();
                    await switchRequest();
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
}

const switchRequest = () =>{
    return window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x3" }]
    });
}
const addSwitchRequest = async () => {
    return window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
            chainId: "0xa869",
            chainName: "Avalanche Testnet",
            nativeCurrency: {
                name: "AVAX",
                symbol: "AVAX",
                decimals: 18
            },
            rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
            blockExplorerUrls: ["https://testnet.explorer.avax.network/"]
        }]
    });
};