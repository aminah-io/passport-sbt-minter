import { Box, Image, Button } from "@chakra-ui/react";
import { NftContract } from "alchemy-sdk";

type StampCardProps = {
  name: string | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
  tokenType: string | undefined;
  contractAddress?: string | undefined;
  tokenId: string;
  setTokenId: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function StampCard({
  name,
  description,
  imageUrl,
  tokenType,
  contractAddress,
  tokenId,
  setTokenId,
}: StampCardProps): JSX.Element {
  // SBT name
  // Description
  // Image
  // Burn button -- needs a modal to ask user if they really want to delete

  return (
    <Box 
      className="border border-solid rounded-lg bg-white mb-4" 
      w="100%" 
      h="124px"
    >
      <Image src={imageUrl} className="" alt={description} />
      <Box className="">
        <p className="">{name}</p>
        <p className="">{description}</p>
        <p>{tokenType}</p>
      </Box>
      <Box className="flex justify-center mt-14">
        <Button
          colorScheme="red"
          value={tokenId}
          onClick={(e) => {
            setTokenId(parseInt(tokenId));
          }}
        >
          Burn SBT
        </Button>
      </Box>
    </Box>
  );
}