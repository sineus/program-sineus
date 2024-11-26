import { SolanaMovie } from "@/idl";
import { IdlAccounts, ProgramAccount } from "@coral-xyz/anchor";

export type Movie = ProgramAccount<IdlAccounts<SolanaMovie>["movie"]>;
