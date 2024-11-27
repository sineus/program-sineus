"use client";

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSolana, useWallet } from "@/providers";
import { getRandomNumber, timeToSeconds } from "@/utils";
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
import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Field } from "./ui/field";

export type CreateMovieProps = {};
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

function parseAnchorError(errorLog: string) {
  try {
    // Extract error code
    const codeMatch = errorLog.match(/Error Code: (.*?)\./);
    const code = codeMatch ? codeMatch[1] : null;

    // Extract error number
    const numberMatch = errorLog.match(/Error Number: (.*?)\./);
    const errorNumber = numberMatch ? numberMatch[1] : null;

    // Extract error message
    const messageMatch = errorLog.match(/Error Message: (.*?)$/);
    const message = messageMatch ? messageMatch[1] : null;

    return {
      code,
      errorNumber,
      message,
    };
  } catch (error) {
    console.error("Error parsing:", error);
    return null;
  }
}

export default function CreateMovie(props: CreateMovieProps) {
  const solana = useSolana();
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const form = useForm<MovieForm>({
    defaultValues: {
      actors: [],
      duration: {
        hour: 1,
        minute: 59,
      },
    },
  });

  const create = useMutation({
    async mutationFn(values: MovieForm) {
      const randomNumber = getRandomNumber();
      const [moviePDA] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("movie"),
          new Uint8Array([randomNumber]),
          wallet.publicKey.toBuffer(),
        ],
        solana.program.programId
      );

      console.log(`Movie PDA: ${moviePDA}`);

      const tx = await solana.program.methods
        .create(
          values.title,
          values.description,
          values.cover,
          new anchor.BN(new Date(values.creation).getMilliseconds()),
          values.director,
          values.actors,
          timeToSeconds(values.duration.hour, values.duration.minute),
          new anchor.BN(values.budget),
          randomNumber
        )
        .accounts({
          creator: wallet.publicKey,
          movie: moviePDA,
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
      form.reset();
    },
    onError(err) {
      console.error(err);

      /* if ("logs" in err) {
        console.log(err.logs);
        const error = err.logs?.find((log) =>
          log.includes("Program log: AnchorError")
        );

        if (error) {
          const formatted = parseAnchorError(error);
          toaster.create({
            title: formatted.message,
            type: "error",
          });
        }
      } */
    },
  });

  const submit = useCallback(async () => {
    create.mutate(form.getValues());
  }, [form, create]);

  return (
    <DialogRoot
      size="xl"
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogTrigger asChild>
        <Button variant="subtle" rounded="full">
          Create
        </Button>
      </DialogTrigger>
      <DialogContent asChild borderRadius="4xl" p="2" gap="5">
        <form onSubmit={form.handleSubmit(submit)}>
          <DialogHeader>
            <Heading>Create movie</Heading>
            <DialogCloseTrigger rounded="full" top="4" right="4" />
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
          <DialogFooter pb="8">
            <Button
              rounded="full"
              type="submit"
              variant="subtle"
              flex="1"
              loading={create.isLoading}
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
