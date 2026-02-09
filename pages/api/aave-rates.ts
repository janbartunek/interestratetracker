import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

type AaveRateRow = {
  tokenSymbol: string;
  tokenAddress: string;
  supplyAPY: number;
  variableBorrowAPY: number;
  stableBorrowAPY: number;
};

const RPC_URL = process.env.RPC_URL || "https://polygon-rpc.com";

const provider = new ethers.JsonRpcProvider(RPC_URL);

const AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS =
  "0x243Aa95cAC2a25651eda86e80bEe66114413c43b";

const AAVE_PROTOCOL_DATA_PROVIDER_ABI = [
  "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)"
];

const dataProvider = new ethers.Contract(
  AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS,
  AAVE_PROTOCOL_DATA_PROVIDER_ABI,
  provider
);

const TOKENS: Record<string, string> = {
  DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
};

function rayToPercent(rayValue: bigint): number {
  const RAY = 10n ** 27n;
  const ratio = Number(rayValue) / Number(RAY);
  return ratio * 100;
}

async function fetchAaveRates(): Promise<AaveRateRow[]> {
  const rows: AaveRateRow[] = [];

  for (const [symbol, assetAddress] of Object.entries(TOKENS)) {
    const reserveData = await dataProvider.getReserveData(assetAddress);

    const liquidityRate: bigint = reserveData.liquidityRate;
    const variableBorrowRate: bigint = reserveData.variableBorrowRate;
    const stableBorrowRate: bigint = reserveData.stableBorrowRate;

    const supplyAPY = rayToPercent(liquidityRate);
    const variableBorrowAPY = rayToPercent(variableBorrowRate);
    const stableBorrowAPY = rayToPercent(stableBorrowRate);

    rows.push({
      tokenSymbol: symbol,
      tokenAddress: assetAddress,
      supplyAPY,
      variableBorrowAPY,
      stableBorrowAPY
    });
  }

  return rows;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const rates = await fetchAaveRates();
    res.status(200).json({
      updatedAt: new Date().toISOString(),
      rates
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching Aave rates:", error);
    res.status(500).json({ error: "Failed to fetch Aave rates" });
  }
}

