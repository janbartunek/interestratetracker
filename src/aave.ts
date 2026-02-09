import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL || "https://polygon-rpc.com";

if (!RPC_URL) {
  throw new Error("RPC_URL is not set. Please define it in a .env file.");
}

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Polygon Aave v3 protocol data provider (IPoolDataProvider)
// Source: Aave address book (AaveV3Polygon.AAVE_PROTOCOL_DATA_PROVIDER)
const AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS =
  "0x243Aa95cAC2a25651eda86e80bEe66114413c43b";

// Minimal ABI for getReserveData we need
// See IPoolDataProvider / AaveProtocolDataProvider interface in Aave docs
const AAVE_PROTOCOL_DATA_PROVIDER_ABI = [
  "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)"
];

const dataProvider = new ethers.Contract(
  AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS,
  AAVE_PROTOCOL_DATA_PROVIDER_ABI,
  provider
);

// Underlying token addresses on Polygon Aave v3
// Source: AaveV3PolygonAssets in the Aave address book
const TOKENS: Record<string, string> = {
  DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
};

// Convert ray (1e27) to percentage APY
function rayToPercent(rayValue: bigint): number {
  const RAY = 10n ** 27n;
  const ratio = Number(rayValue) / Number(RAY);
  return ratio * 100;
}

export type AaveRateRow = {
  tokenSymbol: string;
  tokenAddress: string;
  supplyAPY: number;
  variableBorrowAPY: number;
  stableBorrowAPY: number;
};

export async function fetchAaveRates(): Promise<AaveRateRow[]> {
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

