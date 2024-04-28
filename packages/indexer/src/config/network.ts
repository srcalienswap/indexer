/* eslint-disable no-fallthrough */

// Any new network that is supported should have a corresponding
// entry in the configuration methods below

import { AddressZero } from "@ethersproject/constants";
import * as Sdk from "@reservoir0x/sdk";

import { idb } from "@/common/db";
import { config } from "@/config/index";
import { Currency } from "@/utils/currencies";

export const getNetworkName = () => {
  switch (config.chainId) {
    case 1:
      return "mainnet";

    case 196:
      return "xlayer";

    case 5:
      return "goerli";

    case 10:
      return "optimism";

    case 56:
      return "bsc";

    case 137:
      return "polygon";

    case 324:
      return "zksync";

    case 42161:
      return "arbitrum";

    case 5001:
      return "mantle-testnet";

    case 59140:
      return "linea-testnet";

    case 11155111:
      return "sepolia";

    case 80001:
      return "mumbai";

    case 80002:
      return "amoy";

    case 42170:
      return "arbitrum-nova";

    case 7777777:
      return "zora";

    case 43114:
      return "avalanche";

    case 8453:
      return "base";

    case 59144:
      return "linea";

    case 1101:
      return "polygon-zkevm";

    case 28122024:
      return "ancient8-testnet";

    case 534352:
      return "scroll";

    case 13472:
      return "immutable-zkevm-testnet";

    case 68840142:
      return "frame-testnet";

    case 204:
      return "opbnb";

    case 888888888:
      return "ancient8";

    case 84532:
      return "base-sepolia";

    case 168587773:
      return "blast-sepolia";

    case 70700:
      return "apex";

    case 81457:
      return "blast";

    case 3776:
      return "astar-zkevm";

    case 70800:
      return "apex-testnet";

    case 80085:
      return "berachain-testnet";

    case 17069:
      return "garnet";

    case 690:
      return "redstone";

    default:
      return "unknown";
  }
};

export const getOpenseaNetworkName = () => {
  switch (config.chainId) {
    case 1:
      return "ethereum";
    case 5:
      return "goerli";
    case 137:
      return "matic";
    case 10:
      return "optimism";
    case 42161:
      return "arbitrum";
    case 42170:
      return "arbitrum_nova";
    case 56:
      return "bsc";
    case 43114:
      return "avalanche";
    case 11155111:
      return "sepolia";
    case 80001:
      return "mumbai";
    case 80002:
      return "amoy";
    case 8453:
      return "base";
    case 7777777:
      return "zora";
    case 84532:
      return "base_sepolia";
    case 81457:
      return "blast";
    default:
      return null;
  }
};

export const getOpenseaBaseUrl = () => {
  switch (config.chainId) {
    case 5:
    case 80001:
    case 11155111:
      return "https://testnets-api.opensea.io";
    default:
      return "https://api.opensea.io";
  }
};

export const getServiceName = () => {
  return `indexer-${config.version}-${getNetworkName()}`;
};

export const getSubDomain = () => {
  return `${config.chainId === 1 ? "api" : `api-${getNetworkName()}`}${
    config.environment === "dev" ? ".dev" : ""
  }`;
};

type NetworkSettings = {
  enableWebSocket: boolean;
  enableReorgCheck: boolean;
  reorgCheckFrequency: number[];
  realtimeSyncFrequencySeconds: number;
  realtimeSyncMaxBlockLag: number;
  lastBlockLatency: number;
  headBlockDelay: number;
  backfillBlockBatchSize: number;
  metadataMintDelay: number;
  enableMetadataAutoRefresh: boolean;
  washTradingExcludedContracts: string[];
  washTradingWhitelistedAddresses: string[];
  washTradingBlacklistedAddresses: string[];
  trendingExcludedContracts: string[];
  nonSimulatableContracts: string[];
  customTokenAddresses: string[];
  mintsAsSalesBlacklist: string[];
  mintAddresses: string[];
  burnAddresses: string[];
  whitelistedCurrencies: Map<string, Currency>;
  supportedBidCurrencies: { [currency: string]: boolean };
  coingecko?: {
    networkId: string;
  };
  onStartup?: () => Promise<void>;
  elasticsearch?: {
    numberOfShards?: number;
    indexes?: { [index: string]: ElasticsearchIndexSettings };
  };
  isTestnet?: boolean;
};

type ElasticsearchIndexSettings = {
  numberOfShards?: number;
  disableMappingsUpdate?: boolean;
  configName?: string;
};

export const getNetworkSettings = (): NetworkSettings => {
  const defaultNetworkSettings: NetworkSettings = {
    enableWebSocket: true,
    enableReorgCheck: true,
    realtimeSyncFrequencySeconds: 15,
    realtimeSyncMaxBlockLag: 16,
    lastBlockLatency: 5,
    headBlockDelay: 0,
    backfillBlockBatchSize: 16,
    metadataMintDelay: 5,
    enableMetadataAutoRefresh: false,
    washTradingExcludedContracts: [],
    washTradingWhitelistedAddresses: [],
    washTradingBlacklistedAddresses: [],

    trendingExcludedContracts: [],
    nonSimulatableContracts: [],
    customTokenAddresses: [],
    mintsAsSalesBlacklist: [],
    mintAddresses: [
      AddressZero,
      // Limitbreak
      "0x00000089e8825c9a59b4503398faacf2e9a9cdb0",
    ],
    burnAddresses: [AddressZero, "0x000000000000000000000000000000000000dead"],
    reorgCheckFrequency: [1, 5, 10, 30, 60], // In minutes
    whitelistedCurrencies: new Map<string, Currency>(),
    supportedBidCurrencies: {
      [Sdk.Common.Addresses.WNative[config.chainId]?.toLowerCase()]: true,
      ...Object.fromEntries(
        (Sdk.Common.Addresses.Usdc[config.chainId] ?? []).map((address) => [address, true])
      ),
    },
    elasticsearch: {
      numberOfShards: 2,
      indexes: {
        activities: {
          numberOfShards: 2,
        },
        asks: {
          numberOfShards: 2,
        },
        collections: {
          numberOfShards: 2,
        },
      },
    },
    isTestnet: false,
  };

  switch (config.chainId) {
    // Ethereum
    case 1:
      return {
        ...defaultNetworkSettings,
        realtimeSyncFrequencySeconds: 5,
        enableMetadataAutoRefresh: true,
        washTradingExcludedContracts: [
          // ArtBlocks Contracts
          "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a",
          "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270",
          "0x99a9b7c1116f9ceeb1652de04d5969cce509b069",
          // ArtBlocks Engine Contracts
          "0xbdde08bd57e5c9fd563ee7ac61618cb2ecdc0ce0",
          "0x28f2d3805652fb5d359486dffb7d08320d403240",
          "0x64780ce53f6e966e18a22af13a2f97369580ec11",
          "0x010be6545e14f1dc50256286d9920e833f809c6a",
          "0x13aae6f9599880edbb7d144bb13f1212cee99533",
          "0xa319c382a702682129fcbf55d514e61a16f97f9c",
          "0xd10e3dee203579fcee90ed7d0bdd8086f7e53beb",
          "0x62e37f664b5945629b6549a87f8e10ed0b6d923b",
          "0x0a1bbd57033f57e7b6743621b79fcb9eb2ce3676",
          "0x942bc2d3e7a589fe5bd4a5c6ef9727dfd82f5c8a",
          "0x32d4be5ee74376e08038d652d4dc26e62c67f436",
          // Blend
          "0x29469395eaf6f95920e59f858042f0e28d98a20b",
        ],
        washTradingBlacklistedAddresses: [
          "0xac335e6855df862410f96f345f93af4f96351a87",
          "0x81c6686fbe1594d599ac86a0d8e81d84a2f9bcf2",
          "0x06d51314d152ca4f88d691f87b40cf3bf453df7c",
          "0x39fdf1b13dd5b86eb8b7fdd50bce4607beae0722",
          "0x63605e53d422c4f1ac0e01390ac59aaf84c44a51",
        ],
        nonSimulatableContracts: [
          "0x4d04bba7f5ea45ac59769a1095762467b1157cc4",
          "0x36e73e5e0aaacf4f9c4e67a32b87e8a4273484a5",
        ],
        customTokenAddresses: [
          "0x95784f7b5c8849b0104eaf5d13d6341d8cc40750",
          "0xc9cb0fee73f060db66d2693d92d75c825b1afdbf",
          "0x87d598064c736dd0c712d329afcfaa0ccc1921a1",
        ],
        mintsAsSalesBlacklist: [
          // Uniswap V3: Positions NFT
          "0xc36442b4a4522e871399cd717abdd847ab11fe88",
        ],
        mintAddresses: [
          ...defaultNetworkSettings.mintAddresses,
          // Nifty Gateway Omnibus
          "0xe052113bd7d7700d623414a0a4585bcae754e9d5",
        ],
        trendingExcludedContracts: [
          "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85", // ens
          "0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401", // ens
          "0xc36442b4a4522e871399cd717abdd847ab11fe88", // uniswap positions
        ],
        supportedBidCurrencies: {
          ...defaultNetworkSettings.supportedBidCurrencies,
          // Prime
          "0xb23d80f5fefcddaa212212f028021b41ded428cf": true,
          // USDT
          "0xdac17f958d2ee523a2206206994597c13d831ec7": true,
        },
        whitelistedCurrencies: new Map([
          [
            "0xceb726e6383468dd8ac0b513c8330cc9fb4024a8",
            {
              contract: "0xceb726e6383468dd8ac0b513c8330cc9fb4024a8",
              name: "Worms",
              symbol: "WORMS",
              decimals: 18,
            },
          ],
          [
            "0x55818be03e5103e74f96df7343dd1862a6d215f2",
            {
              contract: "0x55818be03e5103e74f96df7343dd1862a6d215f2",
              name: "BIDENIA",
              symbol: "BIE",
              decimals: 8,
              metadata: {
                image: "https://i.ibb.co/9GP6X1R/bidenia-Token.png",
              },
            },
          ],
          [
            "0xefe804a604fd3175220d5a4f2fc1a048c479c592",
            {
              contract: "0xefe804a604fd3175220d5a4f2fc1a048c479c592",
              name: "PIXAPE",
              symbol: "$pixape",
              decimals: 18,
            },
          ],
          [
            "0xb73758fe1dc58ac2a255a2950a3fdd84da656b84",
            {
              contract: "0xb73758fe1dc58ac2a255a2950a3fdd84da656b84",
              name: "GANG",
              symbol: "GANG",
              decimals: 18,
            },
          ],
          [
            "0x726516b20c4692a6bea3900971a37e0ccf7a6bff",
            {
              contract: "0x726516b20c4692a6bea3900971a37e0ccf7a6bff",
              name: "Frog Coin",
              symbol: "FRG",
              decimals: 18,
            },
          ],
          [
            "0x46898f15f99b8887d87669ab19d633f579939ad9",
            {
              contract: "0x46898f15f99b8887d87669ab19d633f579939ad9",
              name: "Ribbit",
              symbol: "RIBBIT",
              decimals: 18,
            },
          ],
          [
            "0x45f93404ae1e4f0411a7f42bc6a5dc395792738d",
            {
              contract: "0x45f93404AE1E4f0411a7F42BC6a5Dc395792738D",
              name: "DEGEN",
              symbol: "DGEN",
              decimals: 18,
            },
          ],
          [
            "0x313408eb31939a9c33b40afe28dc378845d0992f",
            {
              contract: "0x313408eb31939A9c33B40AFE28Dc378845D0992F",
              name: "BPX",
              symbol: "BPX",
              decimals: 18,
            },
          ],
          [
            "0xaef06250d07cb6389d730d0eec7d90a1549be812",
            {
              contract: "0xaef06250d07cb6389d730d0eec7d90a1549be812",
              name: "RugLabz",
              symbol: "RLBZ",
              decimals: 9,
              metadata: {
                image: "https://i.ibb.co/XYVTLZf/Untitled.png",
              },
            },
          ],
          [
            "0x8962f7352eb3326c15d4820f9fad214b9327714a",
            {
              contract: "0x8962f7352eb3326c15d4820f9fad214b9327714a",
              name: "RugLabsR",
              symbol: "RUGZ",
              decimals: 18,
              metadata: {
                image: "https://i.ibb.co/QrGfv1z/Untitled-1.png",
              },
            },
          ],
          [
            "0xdaa58a1851672a6490e2bb9fdc8868918cdd86e6",
            {
              contract: "0xdaa58a1851672a6490e2bb9fdc8868918cdd86e6",
              name: "STAR",
              symbol: "STAR",
              decimals: 18,
              metadata: {
                image: "https://i.ibb.co/YW5NFVH/STAR.png",
              },
            },
          ],
          [
            "0x4c7c1ec97279a6f3323eab9ab317202dee7ad922",
            {
              contract: "0x4c7c1ec97279a6f3323eab9ab317202dee7ad922",
              name: "FEWL",
              symbol: "FEWL",
              decimals: 18,
              metadata: {
                image:
                  "https://assets.website-files.com/630596599d87c526f9ca6d98/639b38c2171a4bf1981961d5_metaflyer-logomark-large-yellow.png",
              },
            },
          ],
          [
            "0xda9f05a3e133c2907e7173495022a936a3808d45",
            {
              contract: "0xda9f05a3e133c2907e7173495022a936a3808d45",
              name: "Nelkcoin",
              symbol: "NELK",
              decimals: 18,
              metadata: {
                image:
                  "https://ipfs.thirdwebcdn.com/ipfs/QmTVfXH5aogD3u5yCPDp4KAvbFeBGvwkxQKRVEQsftXkfo/favicon-32x32.png",
              },
            },
          ],
          [
            "0xd2d8d78087d0e43bc4804b6f946674b2ee406b80",
            {
              contract: "0xd2d8d78087d0e43bc4804b6f946674b2ee406b80",
              name: "RugBank Token",
              symbol: "RUG",
              decimals: 18,
              metadata: {
                image:
                  "https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0xd2d8d78087d0e43bc4804b6f946674b2ee406b80/logo.png",
              },
            },
          ],
          [
            "0xbb4f3ad7a2cf75d8effc4f6d7bd21d95f06165ca",
            {
              contract: "0xbb4f3ad7a2cf75d8effc4f6d7bd21d95f06165ca",
              name: "Sheesh",
              symbol: "SHS",
              decimals: 18,
              metadata: {
                image:
                  "https://bafybeic2ukraukxbvs7mn5f5xqnqkr42r5exxjpij4fmw4otiows2zjzbi.ipfs-public.thirdwebcdn.com/Screenshot_2023-06-15_003656.png",
              },
            },
          ],
          [
            "0xffd822149fa6749176c7a1424e71a417f26189c8",
            {
              contract: "0xffd822149fa6749176c7a1424e71a417f26189c8",
              name: "Nothing Token",
              symbol: "THING",
              decimals: 18,
            },
          ],
          [
            "0xed5464bd5c477b7f71739ce1d741b43e932b97b0",
            {
              contract: "0xed5464bd5c477b7f71739ce1d741b43e932b97b0",
              name: "BAP Methane",
              symbol: "METH",
              decimals: 0,
              metadata: {
                image: "https://i.ibb.co/Mc5Pmjn/baptoken.png",
              },
            },
          ],
          [
            "0x2bff8ddbc1f13f6f976a8f4d7fee677272fb6e0e",
            {
              contract: "0x2bff8ddbc1f13f6f976a8f4d7fee677272fb6e0e",
              name: "$AURA",
              symbol: "$AURA",
              decimals: 18,
              metadata: {
                image:
                  "https://ipfs.io/ipfs/QmQwUUJMBAPmr6ANAvJavC6bKCXFDZJkyd6zzgZxGJddeQ/AURA%20Coin%20Front.png",
              },
            },
          ],
          [
            "0x5ec03c1f7fa7ff05ec476d19e34a22eddb48acdc",
            {
              contract: "0x5ec03c1f7fa7ff05ec476d19e34a22eddb48acdc",
              name: "ZED Token",
              symbol: "ZED",
              decimals: 18,
              metadata: {
                image:
                  "https://bafkreidcljrhz7hq4h5rarxgxd63tail24mqawllwhxfrvr3esfv2nvyiy.ipfs.nftstorage.link/",
              },
            },
          ],
        ]),
        coingecko: {
          networkId: "ethereum",
        },
        elasticsearch: {
          indexes: {
            activities: {
              ...defaultNetworkSettings.elasticsearch?.indexes?.activities,
              numberOfShards: 100,
            },
          },
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    //XLayer
    case 196: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        headBlockDelay: 10,
        coingecko: {
          networkId: "x-layer",
        },
        elasticsearch: {
          indexes: {
            activities: {
              ...defaultNetworkSettings.elasticsearch?.indexes?.activities,
              numberOfShards: 10,
            },
          },
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'OKB',
                  'OKB',
                  18,
                  '{"coingeckoCurrencyId": "okb", "image": "https://assets.coingecko.com/coins/images/4463/large/WeChat_Image_20220118095654.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Goerli
    case 5: {
      return {
        ...defaultNetworkSettings,
        isTestnet: true,
        backfillBlockBatchSize: 32,
        mintsAsSalesBlacklist: [
          ...defaultNetworkSettings.mintsAsSalesBlacklist,
          // Uniswap V3: Positions NFT
          "0xc36442b4a4522e871399cd717abdd847ab11fe88",
        ],
        washTradingExcludedContracts: [
          // ArtBlocks Contracts
          "0xda62f67be7194775a75be91cbf9feedcc5776d4b",
          // Sound.xyz Contracts
          "0xbe8f3dfce2fcbb6dd08a7e8109958355785c968b",
          // ArtBlocks Engine Contracts
          "0xe480a895de49b49e37a8f0a8bd7e07fc9844cdb9",
        ],
        elasticsearch: {
          indexes: {
            activities: {
              ...defaultNetworkSettings.elasticsearch?.indexes?.activities,
              numberOfShards: 10,
            },
          },
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Optimism
    case 10: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        enableReorgCheck: false,
        realtimeSyncFrequencySeconds: 5,
        realtimeSyncMaxBlockLag: 32,
        lastBlockLatency: 15,
        backfillBlockBatchSize: 60,
        reorgCheckFrequency: [30],
        whitelistedCurrencies: new Map([
          [
            Sdk.Common.Addresses.Usdc[config.chainId][1],
            {
              contract: Sdk.Common.Addresses.Usdc[config.chainId][1],
              name: "USD Coin",
              symbol: "USDC",
              decimals: 6,
              metadata: {
                image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
              },
            },
          ],
        ]),
        coingecko: {
          networkId: "optimistic-ethereum",
        },
        elasticsearch: {
          indexes: {
            activities: {
              ...defaultNetworkSettings.elasticsearch?.indexes?.activities,
              numberOfShards: 10,
            },
          },
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // BSC
    case 56: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        headBlockDelay: 10,
        coingecko: {
          networkId: "binance-smart-chain",
        },
        elasticsearch: {
          indexes: {
            activities: {
              ...defaultNetworkSettings.elasticsearch?.indexes?.activities,
              numberOfShards: 10,
            },
          },
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Binance Coin',
                  'BNB',
                  18,
                  '{"coingeckoCurrencyId": "binancecoin", "image": "https://assets.coingecko.com/coins/images/12591/large/binance-coin-logo.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Polygon
    case 137: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 30,
        lastBlockLatency: 8,
        headBlockDelay: 0,
        backfillBlockBatchSize: 32,
        reorgCheckFrequency: [30],
        mintAddresses: [
          ...defaultNetworkSettings.mintAddresses,
          "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
          "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
        ],
        trendingExcludedContracts: [
          "0x198d38c5f21eab36731d0576560440f70cbd9418", // Yieldnodes
        ],
        whitelistedCurrencies: new Map([
          [
            Sdk.Common.Addresses.Usdc[config.chainId][1],
            {
              contract: Sdk.Common.Addresses.Usdc[config.chainId][1],
              name: "USD Coin",
              symbol: "USDC",
              decimals: 6,
              metadata: {
                image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
              },
            },
          ],
          [
            "0x875f123220024368968d9f1ab1f3f9c2f3fd190d",
            {
              contract: "0x875f123220024368968d9f1ab1f3f9c2f3fd190d",
              name: "RCAX",
              symbol: "RCAX",
              decimals: 18,
              metadata: {
                image: "https://rcax.io/images/coins/rcax/icon.png",
              },
            },
          ],
          [
            "0xc6268a296c810024aa3aa2f5cc2c255bf995aa44",
            {
              contract: "0xc6268a296c810024aa3aa2f5cc2c255bf995aa44",
              name: "r/Poopheadavatars Poops",
              symbol: "POOP",
              decimals: 18,
              metadata: {
                image: "https://rcax.io/images/coins/poop/icon.png",
              },
            },
          ],
          [
            "0xf297c728ce19e9f61f76c4cf958c32e03e024c4b",
            {
              contract: "0xf297c728ce19e9f61f76c4cf958c32e03e024c4b",
              name: "r/FiestaDog Bones",
              symbol: "BONE",
              decimals: 18,
              metadata: {
                image: "https://rcax.io/images/coins/bone/icon.png",
              },
            },
          ],
          [
            "0x43ff18fa32e10873fd9519261004a85ae2c7a65d",
            {
              contract: "0x43ff18fa32e10873fd9519261004a85ae2c7a65d",
              name: "r/PlungerPlanet Plunger Token",
              symbol: "PLUNGER",
              decimals: 18,
              metadata: {
                image: "https://rcax.io/images/coins/plunger/icon.png",
              },
            },
          ],
          [
            "0x7ea837454e3c425e01a8432234140755fc2add1c",
            {
              contract: "0x7ea837454e3c425e01a8432234140755fc2add1c",
              name: "r/PlungerPlanet Tacon Token",
              symbol: "TACO",
              decimals: 18,
              metadata: {
                image: "https://rcax.io/images/coins/taco/icon.png",
              },
            },
          ],
          [
            "0x3b45a986621f91eb51be84547fbd9c26d0d46d02",
            {
              contract: "0x3b45a986621f91eb51be84547fbd9c26d0d46d02",
              name: "Gold Bar Currency",
              symbol: "GXB",
              decimals: 18,
            },
          ],
          [
            "0xdbb5da27ffcfebea8799a5832d4607714fc6aba8",
            {
              contract: "0xdBb5Da27FFcFeBea8799a5832D4607714fc6aBa8",
              name: "DEGEN",
              symbol: "DGEN",
              decimals: 18,
            },
          ],
          [
            "0x456f931298065b1852647de005dd27227146d8b9",
            {
              contract: "0x456f931298065b1852647de005dd27227146d8b9",
              name: "WVAL",
              symbol: "WVAL",
              decimals: 18,
              metadata: {
                image: "https://i.ibb.co/YRFynrp/wvallogo.png",
              },
            },
          ],
          [
            "0x87cc4e6a40c6d3500403a83bbbb5de065fd46ef0",
            {
              contract: "0x87cc4e6a40c6d3500403a83bbbb5de065fd46ef0",
              name: "p_TAVA",
              symbol: "TAVA",
              decimals: 18,
              metadata: {
                image: "https://i.ibb.co/r6s8vym/altava1644570315501.png",
              },
            },
          ],
          [
            "0xca80e0a5c8d56617894eac6737c11965af56cef5",
            {
              contract: "0xca80e0a5c8d56617894eac6737c11965af56cef5",
              name: "Altava Fashion Link",
              symbol: "$FLT",
              decimals: 18,
              metadata: {
                image: "https://i.ibb.co/s91hZsX/FLT-256-Circle.png",
              },
            },
          ],
          [
            "0xdc8b54313ed0ab1a0b6b8728c7d360c671a4b7cb",
            {
              contract: "0xdc8b54313ed0ab1a0b6b8728c7d360c671a4b7cb",
              name: "FEWL",
              symbol: "FEWL",
              decimals: 18,
            },
          ],
        ]),
        coingecko: {
          networkId: "polygon-pos",
        },
        elasticsearch: {
          indexes: {
            activities: {
              ...defaultNetworkSettings.elasticsearch?.indexes?.activities,
              numberOfShards: 100,
            },
          },
        },
        supportedBidCurrencies: {
          ...defaultNetworkSettings.supportedBidCurrencies,
          // WETH
          "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619": true,
          // CONE
          "0xba777ae3a3c91fcd83ef85bfe65410592bdd0f7c": true,
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Matic',
                  'MATIC',
                  18,
                  '{"coingeckoCurrencyId": "matic-network"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // ZKsync
    case 324: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Arbitrum
    case 42161: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        headBlockDelay: 10,
        washTradingExcludedContracts: [
          // Prohibition Contracts - ArtBlocks Engine
          "0x47a91457a3a1f700097199fd63c039c4784384ab",
        ],
        whitelistedCurrencies: new Map([
          [
            Sdk.Common.Addresses.Usdc[config.chainId][1],
            {
              contract: Sdk.Common.Addresses.Usdc[config.chainId][1],
              name: "USD Coin",
              symbol: "USDC",
              decimals: 6,
              metadata: {
                image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
              },
            },
          ],
        ]),
        coingecko: {
          networkId: "arbitrum-one",
        },
        elasticsearch: {
          indexes: {
            activities: {
              ...defaultNetworkSettings.elasticsearch?.indexes?.activities,
              numberOfShards: 10,
            },
          },
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    case 5001: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        headBlockDelay: 10,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'BitDAO',
                  'BIT',
                  18,
                  '{"coingeckoCurrencyId": "bitdao", "image": "https://assets.coingecko.com/coins/images/17627/large/rI_YptK8.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    case 59140: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: false,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        headBlockDelay: 10,
        onStartup: async () => {
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Sepolia
    case 11155111: {
      return {
        ...defaultNetworkSettings,
        isTestnet: true,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        supportedBidCurrencies: {
          ...defaultNetworkSettings.supportedBidCurrencies,
          // PaymentProcessor WETH
          "0xfff9976782d46cc05630d1f6ebab18b2324d6b14": true,
          // USDC
          "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238": true,
        },
        whitelistedCurrencies: new Map([
          [
            "0x570e40a09f77f0a098dc7a7ba803adf1d04dd8ec",
            {
              contract: "0x570e40a09f77f0a098dc7a7ba803adf1d04dd8ec",
              name: "Angel community Token",
              symbol: "ACT",
              decimals: 18,
            },
          ],
          [
            "0xb501ff1d6303158479c8f7bdf5eee8ef1e3cf63e",
            {
              contract: "0xb501FF1d6303158479c8f7BDf5Eee8EF1e3Cf63E",
              name: "fake USD Coin",
              symbol: "USDC",
              decimals: 6,
            },
          ],
          [
            "0xa6de6c90f2ffd30b54b830359a9f17ed44dd63ac",
            {
              contract: "0xA6de6C90f2FFd30B54b830359a9f17Ed44dd63Ac",
              name: "TetherToken",
              symbol: "USDT",
              decimals: 6,
            },
          ],
        ]),
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Mumbai
    case 80001: {
      return {
        ...defaultNetworkSettings,
        isTestnet: true,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        supportedBidCurrencies: {
          ...defaultNetworkSettings.supportedBidCurrencies,
          // OpenSea WETH
          "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa": true,
        },
        lastBlockLatency: 5,
        elasticsearch: {
          indexes: {
            activities: {
              ...defaultNetworkSettings.elasticsearch?.indexes?.activities,
              numberOfShards: 10,
            },
          },
        },
        whitelistedCurrencies: new Map([
          [
            "0x9e9fce924fe52869d13944e9eef02e4db0b2db7d",
            {
              contract: "0x9e9fce924fe52869d13944e9eef02e4db0b2db7d",
              name: "FEWL",
              symbol: "FEWL",
              decimals: 18,
            },
          ],
        ]),
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Matic',
                  'MATIC',
                  18,
                  '{"coingeckoCurrencyId": "matic-network"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Amoy
    case 80002: {
      return {
        ...defaultNetworkSettings,
        isTestnet: true,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        elasticsearch: {
          indexes: {
            activities: {
              ...defaultNetworkSettings.elasticsearch?.indexes?.activities,
              numberOfShards: 10,
            },
          },
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Matic',
                  'MATIC',
                  18,
                  '{"coingeckoCurrencyId": "matic-network"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
        whitelistedCurrencies: new Map([
          [
            "0x8ef069e433022cf3625a086096c3d9ec96da0160",
            {
              contract: "0x8ef069e433022cf3625a086096c3d9ec96da0160",
              name: "ZED Token",
              symbol: "ZED",
              decimals: 18,
              metadata: {
                image:
                  "https://bafkreidcljrhz7hq4h5rarxgxd63tail24mqawllwhxfrvr3esfv2nvyiy.ipfs.nftstorage.link/",
              },
            },
          ],
        ]),
      };
    }
    // Arbitrum Nova
    case 42170: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        coingecko: {
          networkId: "arbitrum-nova",
        },
        customTokenAddresses: ["0x05e986e9ef944ffd425ed07abc2f39e35821d1e0"],
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Zora
    case 7777777: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Avalanche
    case 43114: {
      return {
        ...defaultNetworkSettings,
        metadataMintDelay: 300,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        coingecko: {
          networkId: "avalanche",
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Avalanche',
                  'AVAX',
                  18,
                  '{"coingeckoCurrencyId": "avalanche-2", "image": "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Base
    case 8453: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        customTokenAddresses: ["0x217ec1ac929a17481446a76ff9b95b9a64f298cf"],
        whitelistedCurrencies: new Map([
          [
            Sdk.Common.Addresses.Usdc[config.chainId][1],
            {
              contract: Sdk.Common.Addresses.Usdc[config.chainId][1],
              name: "USD Coin",
              symbol: "USDC",
              decimals: 6,
              metadata: {
                image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
              },
            },
          ],
        ]),
        coingecko: {
          networkId: "base",
        },
        elasticsearch: {
          indexes: {
            activities: {
              ...defaultNetworkSettings.elasticsearch?.indexes?.activities,
              numberOfShards: 5,
            },
          },
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Linea
    case 59144: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: false,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        coingecko: {
          networkId: "linea",
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "wrapped-ether-linea", "image": "https://assets.coingecko.com/coins/images/31019/large/download_%2817%29.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Polygon zkEVM
    case 1101: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        coingecko: {
          networkId: "polygon-zkevm",
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Ancient8 Testnet
    case 28122024: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 2,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Scroll Mainnet
    case 534352: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        headBlockDelay: 10,
        coingecko: {
          networkId: "scroll",
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Immutable zkEVM Testnet
    case 13472: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        headBlockDelay: 10,
        isTestnet: true,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Test ImmutableX',
                  'tIMX',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/17233/standard/immutableX-symbol-BLK-RGB.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Frame Testnet
    case 68840142: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: false,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        isTestnet: true,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // opBNB
    case 204: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: false,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        coingecko: {
          networkId: "opbnb",
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Binance Coin',
                  'BNB',
                  18,
                  '{"coingeckoCurrencyId": "binancecoin", "image": "https://assets.coingecko.com/coins/images/12591/large/binance-coin-logo.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // ancient8
    case 888888888: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 2,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Base Sepolia
    case 84532: {
      return {
        ...defaultNetworkSettings,
        isTestnet: true,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Blast Sepolia
    case 168587773: {
      return {
        ...defaultNetworkSettings,
        isTestnet: true,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Apex
    case 70700: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        customTokenAddresses: [
          "0xaf57145e0c09a75ca4a2dc65ac80c91920e537ce",
          "0x32a93c3e9a3be8f0fdd0835aba7299cba3624b13",
        ],
        coingecko: {
          networkId: "apex",
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Blast
    case 81457: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        coingecko: {
          networkId: "blast",
        },
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Astar Zkevm
    case 3776: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Apex Testnet
    case 70800: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        isTestnet: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Berachain Testnet
    case 80085: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        isTestnet: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Garnet
    case 17069: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: false,
        isTestnet: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Redstone
    case 690: {
      return {
        ...defaultNetworkSettings,
        enableWebSocket: true,
        realtimeSyncMaxBlockLag: 32,
        realtimeSyncFrequencySeconds: 5,
        lastBlockLatency: 5,
        onStartup: async () => {
          // Insert the native currency
          await Promise.all([
            idb.none(
              `
                INSERT INTO currencies (
                  contract,
                  name,
                  symbol,
                  decimals,
                  metadata
                ) VALUES (
                  '\\x0000000000000000000000000000000000000000',
                  'Ether',
                  'ETH',
                  18,
                  '{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}'
                ) ON CONFLICT DO NOTHING
              `
            ),
          ]);
        },
      };
    }
    // Default
    default:
      return {
        ...defaultNetworkSettings,
      };
  }
};
