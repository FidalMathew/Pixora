import { Chain, defineChain } from "viem";

export const iliad = defineChain({
    id: 1513,
    name: 'Story Network Testnet',
    nativeCurrency: {
        name: "Testnet IP",
        symbol: "IP",
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ["https://testnet.storyrpc.io"] },
    },
    blockExplorers: {
        default: { name: "Blockscout", url: "https://testnet.storyscan.xyz" },
    },
    testnet: true
})
