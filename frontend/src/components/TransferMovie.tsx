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
import {
  DialogFooter,
  DialogHeader,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { PropsWithChildren, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Field } from "./ui/field";

export type TransferMovie = {
  movie: Movie;
};

type Form = {
  newAuthority: string;
};

export default function TransferMovie(props: PropsWithChildren<TransferMovie>) {
  const { movie, children } = props;

  const solana = useSolana();
  const wallet = useWallet();
  const [open, setOpen] = useState(false);

  const form = useForm<Form>({
    defaultValues: {
      newAuthority: "",
    },
  });

  const transfer = useMutation({
    async mutationFn(values: Form) {
      const newAuthority = new PublicKey(values.newAuthority);

      const [pda] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("movie"),
          new Uint8Array([movie.account.randomNumber]),
          wallet.publicKey.toBuffer(),
        ],
        solana.program.programId
      );

      const [newPda] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("movie"),
          new Uint8Array([movie.account.randomNumber]),
          newAuthority.toBuffer(),
        ],
        solana.program.programId
      );

      console.log(`Transfer from ${pda} to ${newPda}`);

      const tx = await solana.program.methods
        .transfer()
        .accounts({
          authority: wallet.publicKey,
          newAuthority,
          moviePda: pda,
          newMoviePda: newPda,
        })
        .transaction();

      const { blockhash } = await solana.connection.getLatestBlockhash();

      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;

      return wallet.provider?.signAndSendTransaction(tx);
    },
    onSuccess({ signature }) {
      console.log(signature);
      setOpen(false);
      form.reset();
    },
    onError(err) {
      console.error(err);
    },
  });

  const submit = useCallback(async () => {
    transfer.mutate(form.getValues());
  }, [form, transfer]);

  return (
    <DialogRoot
      size="md"
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent asChild>
        <form onSubmit={form.handleSubmit(submit)}>
          <DialogHeader>
            <Heading>Transfer {movie.account.title}</Heading>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Stack gap="5">
              <Field label="Recipient">
                <Input
                  placeholder="Solana addrres"
                  {...form.register("newAuthority")}
                />
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <Button type="submit" loading={transfer.isLoading}>
              Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
