"use client";

import {
  Message,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

declare global {
  interface Window {
    phantom: Phantom;
  }
}

export type Phantom = {
  solana: {
    isPhantom: boolean;
    connect(): Promise<{
      publicKey: PublicKey;
    }>;
    disconnect(): void;
    on(
      event: "connect" | "disconnect" | "accountChanged",
      callback: (publicKey?: PublicKey) => void
    ): void;
    isConnected: boolean;
    publicKey: PublicKey;
    signTransaction<T extends Transaction | VersionedTransaction>(
      tx: T
    ): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(
      txs: T[]
    ): Promise<T[]>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(
      txs: T
    ): Promise<{ signature: string }>;
    signAndSendAllTransactions<T extends Transaction | VersionedTransaction>(
      txs: T[]
    ): Promise<{ signatures: string[]; publicKey: PublicKey }>;
    signMessage(encodedMessage: Uint8Array, encode: string): Promise<Message>;
  };
};

export type WalletContext = {
  connect: Phantom["solana"]["connect"];
  disconnect: Phantom["solana"]["disconnect"];
  signMessage(): Promise<Message>;
  provider: Phantom["solana"];
  publicKey: Phantom["solana"]["publicKey"];
  connected: boolean;
  walletAddress: string;
  shortWalletAddress: string;
};

const Context = createContext<WalletContext>(null!);

export function useWallet() {
  return useContext(Context);
}

export function WalletProvider(props: PropsWithChildren) {
  const { children } = props;

  const [publicKey, setPublicKey] = useState<PublicKey>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const provider = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    if ("phantom" in window) {
      if (window.phantom?.solana?.isPhantom) {
        return window.phantom?.solana;
      }
    }

    window.open("https://phantom.app/", "_blank");

    return null;
  }, []);

  useEffect(() => {
    provider?.on("connect", (publickey) => {
      setPublicKey(publickey);
      setConnected(true);

      console.log(publickey);
    });

    provider?.on("disconnect", () => {
      setPublicKey(null);
      setConnected(false);
    });

    provider?.on("accountChanged", (publickey) => {
      setPublicKey(publickey);
    });
  }, [provider]);

  useEffect(() => {
    if (!provider) {
      return;
    }

    connect();
  }, [provider]);

  const connect = useCallback(async () => {
    try {
      return provider?.connect();
    } catch (err) {
      console.error(err);
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    return provider?.disconnect();
  }, [provider]);

  const signMessage = useCallback(async () => {
    const message = `To avoid digital dognappers, sign below to authenticate with CryptoCorgis`;
    const encodedMessage = new TextEncoder().encode(message);
    return provider?.signMessage(encodedMessage, "utf8");
  }, [provider]);

  const walletAddress = useMemo(() => publicKey?.toString(), [publicKey]);
  const shortWalletAddress = useMemo(
    () => `${walletAddress?.slice(0, 4)}...${walletAddress?.slice(-4)}`,
    [walletAddress]
  );

  return (
    <Context.Provider
      value={{
        connect,
        disconnect,
        signMessage,
        provider,
        publicKey,
        connected,
        walletAddress,
        shortWalletAddress,
      }}
    >
      {children}
    </Context.Provider>
  );
}
