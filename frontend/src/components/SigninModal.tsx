"use client";

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSolana, useWallet, WalletAdapter } from "@/providers";
import {
  DialogHeader,
  Heading,
  HStack,
  Separator,
  Spacer,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { PropsWithChildren, useState } from "react";
import PhantomIcon from "./icons/Phantom";
import SolflareIcon from "./icons/Solflare";
import { Button } from "./ui/button";

export default function TransferMovie(props: PropsWithChildren<{}>) {
  const { children } = props;

  const solana = useSolana();
  const wallet = useWallet();
  const [open, setOpen] = useState(false);

  return (
    <DialogRoot
      size="sm"
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent borderRadius="4xl" p="2" gap="5">
        <DialogHeader>
          <VStack justifyContent="center">
            <Heading fontSize="2xl">Welcome back</Heading>
            <Text textAlign="center" color="gray.400">
              To get started connect your wallet.
            </Text>
          </VStack>
          <DialogCloseTrigger rounded="full" top="4" right="4" />
        </DialogHeader>
        <DialogBody>
          <Stack gap="3">
            <HStack>
              <HStack gap="4">
                <PhantomIcon w="24px" />
                Phantom
              </HStack>
              <Spacer />
              <Button
                variant="subtle"
                rounded="full"
                onClick={() => wallet.connect(WalletAdapter.Phantom)}
              >
                Connect
              </Button>
            </HStack>
            <Separator borderColor="whiteAlpha.100" />
            <HStack>
              <HStack gap="4">
                <SolflareIcon w="24px" />
                Solflare
              </HStack>
              <Spacer />
              <Button
                variant="subtle"
                rounded="full"
                onClick={() => wallet.connect(WalletAdapter.Solflare)}
              >
                Connect
              </Button>
            </HStack>
          </Stack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
