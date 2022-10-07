import { PROVIDER_ID } from "@gitcoinco/passport-sdk-types";

export function createHash(address: string, providerId: PROVIDER_ID) {
  return `${address}#${providerId}`
}