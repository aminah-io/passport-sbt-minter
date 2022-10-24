// -- React
import { useEffect, useState } from "react";

// -- Components
import StampCard from "./StampCard";
import { Grid, GridItem } from "@chakra-ui/react";

// -- Types
import { TokenId, TokenIdHashList } from "../../types/types";

import { Network, Alchemy, OwnedNftsResponse } from "alchemy-sdk";

const settings = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_GOERLI,
};

type StampSbtListProps = {
  usersTokenList?: OwnedNftsResponse;
  setTokenId: React.Dispatch<React.SetStateAction<TokenId | undefined>>;
  tokenAmount: number;
  tokenIdHashesList: TokenIdHashList[];
  address: string | undefined;
}

export default function StampSbtList({
  address,
  setTokenId,
  tokenAmount,
  tokenIdHashesList,
}: StampSbtListProps): JSX.Element {
  const [burnTxSuccessful, setBurnTxSuccessful] = useState<boolean>();
  const [usersTokenList, setUsersTokenList] = useState<OwnedNftsResponse>();

  const alchemy = new Alchemy(settings);
   // ---- Set the SBTs the address owns
   useEffect(() => {
    if (address || burnTxSuccessful) {
      async function getSbtsForAddress(): Promise<void> {
        const owner = await alchemy.nft.getNftsForOwner(address!);
        setUsersTokenList(owner);
      }
      getSbtsForAddress();
    }
  }, [address]);

  const tokenList = usersTokenList?.ownedNfts.map((sbt, i) => {
    if (sbt.contract.address === `${import.meta.env.VITE_PASSPORT_SBT_CONTRACT_ADDRESS}`.toLowerCase()) {
      return (
        <StampCard
          key={sbt.tokenId}
          name={sbt.rawMetadata?.name}
          description={sbt.rawMetadata?.description}
          imageUrl={sbt.rawMetadata?.image}
          tokenType={sbt.contract?.tokenType}
          contractAddress={sbt.contract?.address}
          sbtTokenId={sbt.tokenId}
          setTokenId={setTokenId}
          tokenAmount={tokenAmount}
          tokenIdHashesList={tokenIdHashesList}
          setBurnTxSuccessful={setBurnTxSuccessful}
        />
      );
    }
  });
  
  return (
    <Grid templateColumns='repeat(2, 1fr)' gap={4}>
      <GridItem w="100%">
        {tokenList}
      </GridItem>
    </Grid>
  );
}