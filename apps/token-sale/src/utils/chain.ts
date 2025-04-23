import { deployments } from "@axis-finance/deployments";

import { environment } from "utils/environment";
import { Chain } from "viem";
import { mainnet, sepolia } from "viem/chains";

export const activeChains = environment.isTestnet ? [sepolia] : [mainnet];

export const getBlockExplorer = (chain: Chain) => {
  return {
    name: chain.blockExplorers?.default.name,
    url: chain.blockExplorers?.default.url + "/",
    baseUrl: chain.blockExplorers?.default.url,
  };
};

export function getChainId(chainName?: string): number {
  const chainId = activeChains.find(
    (c) => c.name.toLocaleLowerCase() === chainName?.toLocaleLowerCase(),
  )?.id;

  if (chainId === undefined) {
    throw new Error(`Chain ${chainName} is not supported`);
  }

  return chainId;
}

export function getChainById(chainId: number): Chain {
  const chain = activeChains.find((c) => c.id === chainId);

  if (!chain) throw new Error(`Unable to find chain ${chainId}`);

  return chain;
}

export function getDeploymentByChainId(chainId: number) {
  const deployment = deployments[chainId];

  if (!deployment)
    throw new Error(`Unable to find deployment for chainId ${chainId}`);

  return deployment;
}
