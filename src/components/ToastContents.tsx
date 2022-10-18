import { Box } from "@chakra-ui/react";

type ToastProps = {
  result: any;
}
export const ToastContents = ({ result }: ToastProps) => {
  return (
    <>
      <Box color="#fff" p={3} bg="purple.500">
        <p>Minting Already Happened!</p>
        <p>You've successfully minted your Passport Soulbound Tokens 👍</p>
      </Box>
    </>
  );
}