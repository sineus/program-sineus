"use client";

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSolana, useWallet } from "@/providers";
import { Movie } from "@/types";
import { DialogFooter, DialogHeader, Heading, Text } from "@chakra-ui/react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";
import { Button } from "./ui/button";

export type RemoveMovieProps = {
  movie: Movie;
  removed(): void;
};

export default function RemoveMovie(
  props: PropsWithChildren<RemoveMovieProps>
) {
  const { movie, removed, children } = props;

  const solana = useSolana();
  const wallet = useWallet();
  const [open, setOpen] = useState(false);

  const remove = useMutation({
    async mutationFn() {
      const [moviePDA] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("movie"),
          new Uint8Array([movie.account.randomNumber]),
          wallet.publicKey.toBuffer(),
        ],
        solana.program.programId
      );

      console.log(`Movie PDA: ${moviePDA}`);

      const tx = await solana.program.methods
        .remove()
        .accounts({
          authority: wallet.publicKey,
          moviePda: moviePDA,
        })
        .transaction();

      const { blockhash } = await solana.connection.getLatestBlockhash();

      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;

      const { value } = await solana.connection.simulateTransaction(
        new VersionedTransaction(tx.compileMessage())
      );

      if (value.err || value.logs?.some((log) => log.includes("Error"))) {
        throw value.err;
      }

      return wallet.provider?.signAndSendTransaction(tx);
    },
    onSuccess({ signature }) {
      console.log(signature);
      setOpen(false);
      removed();
    },
    onError(err) {
      console.error(err);
    },
  });

  return (
    <DialogRoot
      size="sm"
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent asChild>
        <DialogHeader>
          <Heading>Remove {movie.account.title}</Heading>
          <DialogCloseTrigger onClick={() => setOpen(false)} />
        </DialogHeader>
        <DialogBody>
          <Text>Are you sure to remove {movie.account.title}</Text>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => remove.mutate()} loading={remove.isLoading}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
