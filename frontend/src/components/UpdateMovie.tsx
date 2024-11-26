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
import { secondsToTime, timeToSeconds } from "@/utils";
import {
  DialogFooter,
  DialogHeader,
  Heading,
  HStack,
  Input,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { PropsWithChildren, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Field } from "./ui/field";

export type UpdateMovieProps = {
  movie: Movie;
};
type MovieForm = {
  title: string;
  description: string;
  cover: string;
  creation: string;
  director: string;
  actors: string[];
  duration: {
    hour: number;
    minute: number;
  };
  budget: number;
};

export default function UpdateMovie(
  props: PropsWithChildren<UpdateMovieProps>
) {
  const { movie, children } = props;

  const solana = useSolana();
  const wallet = useWallet();
  const [open, setOpen] = useState(false);

  const form = useForm<MovieForm>({
    defaultValues: {
      title: movie.account.title,
      description: movie.account.description,
      director: movie.account.director,
      cover: movie.account.cover,
      actors: movie.account.actors,
      creation: new Date(movie.account.year.toNumber()).toISOString(),
      duration: secondsToTime(movie.account.duration),
      budget: movie.account.budget.toNumber(),
    },
  });

  const update = useMutation({
    async mutationFn(values: MovieForm) {
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
        .update(
          values.title,
          values.description,
          values.cover,
          new anchor.BN(new Date(values.creation).getMilliseconds()),
          values.director,
          values.actors,
          timeToSeconds(values.duration.hour, values.duration.minute),
          new anchor.BN(values.budget)
        )
        .accounts({
          authority: wallet.publicKey,
          moviePda: moviePDA,
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
    update.mutate(form.getValues());
  }, [form, update]);

  return (
    <DialogRoot
      size="xl"
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent asChild>
        <form onSubmit={form.handleSubmit(submit)}>
          <DialogHeader>
            <Heading>Update {movie.account.title}</Heading>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Stack gap="5">
              <Field label="Title">
                <Input placeholder="e.g. Matrix" {...form.register("title")} />
              </Field>
              <Field label="Synopsis">
                <Textarea
                  placeholder="e.g. When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence."
                  rows={6}
                  {...form.register("description")}
                />
              </Field>
              <Field label="Director">
                <Input
                  placeholder="The movie director"
                  {...form.register("director")}
                />
              </Field>
              <Field label="Cover">
                <Input
                  placeholder="e.g. https://www.movieposters.com/cdn/shop/files/Matrix.mpw.102176_bb2f6cc5-4a16-4512-881b-f855ead3c8ec_480x.progressive.jpg?v=1708703624"
                  {...form.register("cover")}
                />
              </Field>
              <Field label="Creation date">
                <Input
                  type="date"
                  placeholder="e.g. 11/06/2003"
                  {...form.register("creation")}
                />
              </Field>

              <HStack>
                <Field label="Duration (hour)">
                  <Input
                    type="number"
                    {...form.register("duration.hour")}
                    min="0"
                    max="23"
                  />
                </Field>
                <Field label="Duration (minute)">
                  <Input
                    type="number"
                    {...form.register("duration.minute")}
                    min="0"
                    max="59"
                  />
                </Field>
              </HStack>
              <Field label="Budget ($)">
                <Input type="number" {...form.register("budget")} min="1" />
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <Button type="submit" loading={update.isLoading}>
              Edit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
