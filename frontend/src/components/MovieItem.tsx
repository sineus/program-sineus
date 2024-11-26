"use client";

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWallet } from "@/providers";
import { Movie } from "@/types";
import {
  Box,
  Button,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Image,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { HiDotsHorizontal, HiPlay } from "react-icons/hi";
import RemoveMovie from "./RemoveMovie";
import TransferMovie from "./TransferMovie";
import UpdateMovie from "./UpdateMovie";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "./ui/menu";

export type MovieItemProps = {
  movie: Movie;
};

export default function MovieItem(props: MovieItemProps) {
  const { movie } = props;
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const isAuthority = useMemo(
    () => wallet.publicKey?.equals(movie.account.authority),
    [wallet.publicKey, movie.account.authority]
  );

  return (
    <DialogRoot
      size="xl"
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogTrigger asChild>
        <GridItem
          display="flex"
          flexDirection="column"
          gap="2"
          borderRadius="xl"
          overflow="hidden"
          transition="all .2s ease"
          cursor="pointer"
          _hover={{
            "& img": {
              transform: "scale(1.04)",
            },
          }}
          position="relative"
        >
          <Image
            src={movie.account.cover}
            alt={movie.account.title}
            width="100%"
            height="100%"
            transition="all .6s cubic-bezier(0.16, 1, 0.3, 1)"
          />
          {isAuthority ? (
            <MenuRoot>
              <MenuTrigger asChild>
                <IconButton
                  variant="subtle"
                  rounded="full"
                  size="sm"
                  position="absolute"
                  top="2"
                  right="2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HiDotsHorizontal />
                </IconButton>
              </MenuTrigger>

              <MenuContent portalled onClick={(e) => e.stopPropagation()}>
                <UpdateMovie movie={movie}>
                  <MenuItem value="update">Update</MenuItem>
                </UpdateMovie>

                <TransferMovie movie={movie}>
                  <MenuItem value="transfer">Transfer</MenuItem>
                </TransferMovie>

                <RemoveMovie movie={movie} removed={() => setOpen(false)}>
                  <MenuItem value="remove">Remove</MenuItem>
                </RemoveMovie>
              </MenuContent>
            </MenuRoot>
          ) : null}
        </GridItem>
      </DialogTrigger>
      <DialogContent rounded="3xl" overflow="hidden">
        <DialogCloseTrigger position="absolute" top="5" right="5" zIndex="2" />
        <DialogBody p="0">
          <Box
            display="flex"
            alignItems="flex-end"
            w="100%"
            height="60vh"
            overflow="hidden"
            bg={`url(${movie.account.cover}) no-repeat top / cover`}
            position="relative"
          >
            <Box
              position="absolute"
              left="0"
              top="0"
              w="100%"
              h="100%"
              bg="linear-gradient(0deg, rgba(17,17,17,1) 0%, rgba(17,17,17,0) 100%)"
              zIndex="1"
            />
            <VStack alignItems="start" gap="5" p="10" w="100%" zIndex="2">
              <Heading size="4xl">{movie.account.title}</Heading>
              <HStack>
                <Button rounded="full">
                  <HiPlay />
                  Lecture
                </Button>
              </HStack>
            </VStack>
          </Box>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
