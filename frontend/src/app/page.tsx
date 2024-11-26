"use client";

import Brand from "@/components/Brand";
import CreateMovie from "@/components/CreateMovie";
import MovieItem from "@/components/MovieItem";
import SkeletonMovieGrid from "@/components/SkeletonMovieGrid";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useMovies } from "@/composables";
import { useWallet } from "@/providers";
import {
  Grid,
  HStack,
  IconButton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { HiClipboardCopy } from "react-icons/hi";

export default function Home() {
  const wallet = useWallet();
  const { movies, isLoading } = useMovies();

  return (
    <VStack px="8" gap="10">
      <Stack
        w="100%"
        direction="row"
        h="68px"
        alignItems="center"
        gap="8"
        justifyContent="space-between"
      >
        <Brand />

        <Stack direction="row" alignItems="center" gap="0">
          <Button variant="ghost" rounded="full">
            Home
          </Button>
          <Button variant="ghost" rounded="full">
            Shows
          </Button>
          <Button variant="ghost" rounded="full">
            Movies
          </Button>
          <Button variant="ghost" rounded="full">
            Account
          </Button>
        </Stack>
        <HStack gap="5">
          {wallet.connected ? (
            <>
              <Tooltip content="Copy wallet address">
                <IconButton
                  size="sm"
                  rounded="full"
                  variant="subtle"
                  onClick={() =>
                    navigator.clipboard.writeText(wallet.walletAddress)
                  }
                >
                  <HiClipboardCopy />
                </IconButton>
              </Tooltip>
              <Text>{wallet?.shortWalletAddress}</Text>
              <HStack>
                <CreateMovie />
                <Button
                  variant="subtle"
                  rounded="full"
                  onClick={() => wallet.disconnect()}
                >
                  Disconnect
                </Button>
              </HStack>
            </>
          ) : (
            <Button
              variant="subtle"
              rounded="full"
              onClick={() => wallet.connect()}
            >
              Connect
            </Button>
          )}
        </HStack>
      </Stack>
      {isLoading ? (
        <SkeletonMovieGrid />
      ) : (
        <Grid templateColumns="repeat(6, 1fr)" gap="6">
          {movies?.map((movie) => (
            <MovieItem key={movie.publicKey.toString()} movie={movie} />
          ))}
        </Grid>
      )}
    </VStack>
  );
}
