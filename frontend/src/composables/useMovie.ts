"use client";

import { SolanaMovie } from "@/idl";
import { useSolana } from "@/providers/SolanaProvider";
import { IdlEvents } from "@coral-xyz/anchor";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useMovies() {
  const solana = useSolana();

  const {
    data: movies,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["movies"],
    queryFn() {
      return solana.program?.account.movie.all();
    },
  });
  useEffect(() => {
    if (!solana.program) {
      return;
    }

    const events: Array<keyof IdlEvents<SolanaMovie>> = [
      "movieCreated",
      "movieUpdated",
      "movieRemoved",
      "movieTransfered",
    ];
    const listeners = [];

    for (const event of events) {
      listeners.push(
        solana.program.addEventListener(event, () => {
          refetch();
        })
      );
    }

    return () => {
      listeners.map((listener) => solana.program.removeEventListener(listener));
    };
  }, [solana.program, refetch]);

  return {
    movies,
    isLoading,
  };
}
