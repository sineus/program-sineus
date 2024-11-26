"use client";

import { SolanaMovie } from "@/idl";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import idl from "../idl/idl.json";
import { useWallet } from "./WalletProvider";

export type SolanaContext = {
  connection: Connection;
  program: Program<SolanaMovie> | null;
  provider: AnchorProvider | null;
};

const Context = createContext<SolanaContext>(null!);
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export function useSolana() {
  return useContext(Context);
}

export function SolanaProvider(props: PropsWithChildren<{}>) {
  const { children } = props;
  const wallet = useWallet();

  const provider = useMemo(() => {
    return new AnchorProvider(
      connection as Connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.provider?.signTransaction,
        signAllTransactions: wallet.provider?.signAllTransactions,
      },
      {
        preflightCommitment: "processed",
        commitment: "confirmed",
      }
    );
  }, [wallet.connected, wallet.publicKey, wallet.provider]);

  const program = useMemo(() => {
    if (!provider) {
      return null;
    }

    return new Program(idl as SolanaMovie, provider);
  }, [provider]);

  return (
    <Context.Provider
      value={{
        connection,
        program,
        provider,
      }}
    >
      {children}
    </Context.Provider>
  );
}
