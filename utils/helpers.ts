import { PROVIDER_ID } from "../types/types";
import { BytesLike, keccak256, toUtf8Bytes, id } from "ethers/lib/utils";

export function createHash(address: string, providerId: PROVIDER_ID) {
  return `${address}#${providerId}`;
}