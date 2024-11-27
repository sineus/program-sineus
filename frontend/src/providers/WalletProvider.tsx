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

export type Provider = {
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
  removeAllListeners(): void;
};

export type SolflareWindow = Provider & {
  isSolflare: boolean;
};

export type PhantomWindow = {
  solana: {
    isPhantom: boolean;
  } & Provider;
};

declare global {
  interface Window {
    phantom: PhantomWindow;
    solflare: SolflareWindow;
    SolflareApp: any;
  }
}

export type WalletContext = {
  connect(adapter: WalletAdapter): Promise<{
    publicKey: PublicKey;
  }>;
  disconnect: Provider["disconnect"];
  signMessage(): Promise<Message>;
  provider: Provider;
  publicKey: Provider["publicKey"];
  connected: boolean;
  walletAddress: string;
  shortWalletAddress: string;
};

export enum WalletAdapter {
  Phantom,
  Solflare,
}

function getProvider(adapter: WalletAdapter) {
  if (adapter === WalletAdapter.Phantom) {
    if ("phantom" in window) {
      if (window.phantom?.solana?.isPhantom) {
        return window.phantom?.solana;
      }
    }

    window.open("https://phantom.app/", "_blank");
  } else if (adapter === WalletAdapter.Solflare) {
    if (window.solflare?.isSolflare || window.SolflareApp) {
      return window.solflare;
    }

    window.open("https://solflare.com/", "_blank");
  }

  return null;
}

const Context = createContext<WalletContext>(null!);

export function useWallet() {
  return useContext(Context);
}

export function WalletProvider(props: PropsWithChildren) {
  const { children } = props;

  const [publicKey, setPublicKey] = useState<PublicKey>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [provider, setProvider] = useState<Provider>();
  const [adapter, setAdapter] = useState<WalletAdapter>();

  useEffect(() => {
    provider?.on("connect", async (publickey) => {
      try {
        await signMessage();
        setPublicKey(publickey);
        setConnected(true);

        console.log(publickey);
      } catch (err) {
        disconnect();
      }
    });

    provider?.on("disconnect", () => {
      setPublicKey(null);
      setConnected(false);
      setAdapter(null);
      setProvider(null);
    });

    provider?.on("accountChanged", (publickey) => {
      setPublicKey(publickey);
    });

    return () => {
      provider?.removeAllListeners();
    };
  }, [provider]);

  /* useEffect(() => {
    if (!provider) {
      return;
    }

    connect(adapter);
  }, [provider, adapter]); */

  const connect = useCallback(
    async (selectedAdapter: WalletAdapter) => {
      try {
        setAdapter(selectedAdapter);
        setProvider(getProvider(selectedAdapter));

        return provider?.connect();
      } catch (err) {
        console.error(err);
      }
    },
    [provider]
  );

  const disconnect = useCallback(async () => {
    provider?.disconnect();
  }, [provider]);

  const signMessage = useCallback(async () => {
    const message = `To avoid digital dognappers, sign below to authenticate with Solana Movie`;
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
