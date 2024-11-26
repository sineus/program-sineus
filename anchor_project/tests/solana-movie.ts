import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { before } from "mocha";
import { SolanaMovie } from "../target/types/solana_movie";

const movies = [
  {
    title: "Kill Bill : Volume 1",
    description:
      "Au cours d'une cérémonie de mariage en plein désert, un commando fait irruption dans la chapelle et tire sur les convives. Laissée pour morte, la mariée enceinte retrouve ses esprits après un coma de quatre ans.",
    cover:
      "https://fr.web.img2.acsta.net/medias/nmedia/18/35/13/44/18364816.jpg",
    director: "Quentin Tarantino",
    actors: ["Uma Thurman", "Lucy Liu", "David Carradine"],
    year: new anchor.BN(new Date("11/26/2003").getMilliseconds()),
    duration: timeToSeconds(1, 51),
    budget: new anchor.BN(30000000),
  },
  {
    title: "Bienvenue à Gattaca",
    description:
      "Dans un futur proche, notre société pratique l'eugénisme à grande échelle : les gamètes des parents sont triés et sélectionnés afin de concevoir in vitro des enfants quasi parfaits. Malgré l'interdiction officielle, les entreprises recourent à des tests ADN discrets afin de sélectionner leurs employés. Ainsi, les personnes conçues naturellement se voient reléguées à des tâches subalternes.",
    cover:
      "https://fr.web.img5.acsta.net/medias/nmedia/18/36/17/53/18458816.jpg",
    director: "Andrew Niccol",
    actors: ["Uma Thurman", "Ethan Hawke", "Jude Law"],
    year: new anchor.BN(new Date("04/29/1998").getMilliseconds()),
    duration: timeToSeconds(1, 46),
    budget: new anchor.BN(36000000),
  },
  {
    title: "Captain Fantastic",
    description:
      "Ben Cash, sa femme Leslie et leurs six enfants habitent dans une région sauvage de l'état de Washington.",
    cover: "https://fr.web.img4.acsta.net/pictures/16/07/05/10/58/324651.jpg",
    director: "Matt Ross",
    actors: ["Viggo Mortensen", "Samantha Isler", "George MacKay"],
    year: new anchor.BN(new Date("07/08/2016").getMilliseconds()),
    duration: timeToSeconds(1, 58),
    budget: new anchor.BN(5000000),
  },
];

function createMovie(
  creator: Keypair,
  moviePDA: PublicKey,
  randomNumber: number,
  movie: (typeof movies)[number]
) {
  return program.methods
    .create(
      movie.title,
      movie.description,
      movie.cover,
      movie.year,
      movie.director,
      movie.actors,
      movie.duration,
      movie.budget,
      randomNumber
    )
    .accounts({
      creator: creator.publicKey,
      movie: moviePDA,
    })
    .signers([creator])
    .rpc();
}

function updateMovie(
  authority: Keypair,
  moviePDA: PublicKey,
  movie: (typeof movies)[number]
) {
  return program.methods
    .update(
      movie.title,
      movie.description,
      movie.cover,
      movie.year,
      movie.director,
      movie.actors,
      movie.duration,
      movie.budget
    )
    .accounts({
      authority: authority.publicKey,
      moviePda: moviePDA,
    })
    .signers([authority])
    .rpc();
}

function removeMovie(authority: Keypair, moviePDA: PublicKey) {
  return program.methods
    .remove()
    .accounts({
      authority: authority.publicKey,
      moviePda: moviePDA,
    })
    .signers([authority])
    .rpc();
}

function timeToSeconds(hours: number, minutes: number) {
  return hours * 3600 + minutes * 60;
}

async function airdrop(address: PublicKey, amount: number) {
  const airdropTransaction = await program.provider.connection.requestAirdrop(
    address,
    amount * LAMPORTS_PER_SOL
  );

  const { blockhash, lastValidBlockHeight } =
    await program.provider.connection.getLatestBlockhash();

  await program.provider.connection.confirmTransaction(
    {
      blockhash,
      lastValidBlockHeight,
      signature: airdropTransaction,
    },
    "confirmed"
  );
}

function generateRandomString(bytes: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < bytes; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getRandomNumber() {
  return Math.floor(Math.random() * 256);
}

// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.SolanaMovie as Program<SolanaMovie>;

/**
 * @todo
 *
 * Complete requirements:
 * - Deploy frontend with vercel
 * - Write README for the frontend (see requirements)
 * - Write README for the program (see requirements)
 *
 * Additional features:
 * - Allow the user to transfer a movie PDA to another (authority transfer)
 * - Reduce the struct of Movie with metadata uri json uploaded to irys network (IPFS)
 * - Create MOVIE token with SPL
 * - Give MOVIE token to user when he creates new movie (ex: 10K)
 * - Add constraint to update movie if the user hasn't more 50K MOVIE token (100K = contributor)
 * - Add staking for MOVIE with 20% APY
 */

describe("solana-movie", () => {
  const creators = {
    a: Keypair.generate(),
    b: Keypair.generate(),
  };
  const movieData = movies[Math.floor(Math.random() * movies.length)];
  const updatedMovieData = {
    ...movieData,
    title: "I'm fine",
    description: "Edited description",
    cover: "https://media.tenor.com/iNwn_gChTCQAAAAM/this-is-fine.gif",
    director: "Ackee",
    actors: ["Hello world", "Solana", "MOVIE"],
    year: new anchor.BN(new Date("01/01/1984").getMilliseconds()),
    duration: timeToSeconds(3, 20),
    budget: new anchor.BN(3000000000),
  };
  const randomNumber = getRandomNumber();
  const [moviePDA] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("movie"),
      new Uint8Array([randomNumber]),
      creators.a.publicKey.toBuffer(),
    ],
    program.programId
  );

  console.log(`Movie PDA: ${moviePDA}`);

  before(async () => {
    await airdrop(creators.a.publicKey, 5);
    await airdrop(creators.b.publicKey, 5);
  });

  it("Create new movie PDA with a long title", async () => {
    try {
      await createMovie(creators.a, moviePDA, randomNumber, {
        ...movieData,
        title: generateRandomString(51),
      });
    } catch (err) {
      assert.strictEqual(err.error.errorCode.code, "TitleTooLong");
    }
  });

  it("Create new movie PDA with a long description", async () => {
    try {
      await createMovie(creators.a, moviePDA, randomNumber, {
        ...movieData,
        description: generateRandomString(501),
      });
    } catch (err) {
      assert.strictEqual(err.error.errorCode.code, "DescriptionTooLong");
    }
  });

  it("Create new movie PDA with a long cover", async () => {
    try {
      await createMovie(creators.a, moviePDA, randomNumber, {
        ...movieData,
        cover: generateRandomString(101),
      });
    } catch (err) {
      assert.strictEqual(err.error.errorCode.code, "CoverTooLong");
    }
  });

  it("Create new movie PDA with a long director", async () => {
    try {
      await createMovie(creators.a, moviePDA, randomNumber, {
        ...movieData,
        director: generateRandomString(51),
      });
    } catch (err) {
      assert.strictEqual(err.error.errorCode.code, "DirectorTooLong");
    }
  });

  it("Create new movie PDA with a too many actors", async () => {
    try {
      await createMovie(creators.a, moviePDA, randomNumber, {
        ...movieData,
        actors: Array.from({ length: 11 }).map((i) => `actor-${i}`),
      });
    } catch (err) {
      assert.strictEqual(err.error.errorCode.code, "TooManyActors");
    }
  });

  it("Create new movie PDA", async () => {
    const tx = await createMovie(creators.a, moviePDA, randomNumber, movieData);

    console.log(`Signature: ${tx}`);

    // Check if data contained by the PDA is the same
    const data = await program.account.movie.fetch(moviePDA);

    assert.strictEqual(data.title, movieData.title);
    assert.strictEqual(data.description, movieData.description);
    assert.strictEqual(data.cover, movieData.cover);
    assert.strictEqual(data.director, movieData.director);
    assert.strictEqual(data.duration, movieData.duration);
    assert.strictEqual(data.budget.toString(), movieData.budget.toString());
    assert.strictEqual(data.year.toString(), movieData.year.toString());
  });

  it("Update a movie with the correct authority", async () => {
    // Send transaction to update the movie
    const tx = await updateMovie(creators.a, moviePDA, updatedMovieData);

    console.log(`Signature: ${tx}`);

    // Get the movie data from program account
    const data = await program.account.movie.fetch(moviePDA);

    assert.strictEqual(data.title, updatedMovieData.title);
    assert.strictEqual(data.description, updatedMovieData.description);
    assert.strictEqual(data.cover, updatedMovieData.cover);
    assert.strictEqual(data.director, updatedMovieData.director);
    assert.strictEqual(data.duration, updatedMovieData.duration);
    assert.strictEqual(
      data.budget.toString(),
      updatedMovieData.budget.toString()
    );
    assert.strictEqual(data.year.toString(), updatedMovieData.year.toString());
  });

  it("Update a movie with a incorrect authority", async () => {
    try {
      await updateMovie(creators.b, moviePDA, updatedMovieData);
    } catch (err) {
      assert.strictEqual(
        err.error.errorMessage,
        `A seeds constraint was violated`
      );
    }
  });

  it("Update a movie with a incorrect PDA", async () => {
    try {
      // Get an incorrect PDA to update the movie, but it's failed because the PDA not initialized
      const [incorrectPDA] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("movie"),
          new Uint8Array([randomNumber]),
          creators.b.publicKey.toBuffer(),
        ],
        program.programId
      );

      await updateMovie(creators.a, incorrectPDA, updatedMovieData);
    } catch (err) {
      assert.strictEqual(
        err.error.errorMessage,
        `The program expected this account to be already initialized`
      );
    }
  });

  it("Remove a movie with a incorrect authority", async () => {
    try {
      await removeMovie(creators.b, moviePDA);
    } catch (err) {
      assert.strictEqual(
        err.error.errorMessage,
        `A seeds constraint was violated`
      );
    }
  });

  it("Remove a movie with a incorrect PDA", async () => {
    try {
      // Get an incorrect PDA to remove the movie, but it's failed because the PDA not initialized
      const [incorrectPDA] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("movie"),
          new Uint8Array([randomNumber]),
          creators.b.publicKey.toBuffer(),
        ],
        program.programId
      );

      await removeMovie(creators.a, incorrectPDA);
    } catch (err) {
      assert.strictEqual(
        err.error.errorMessage,
        `The program expected this account to be already initialized`
      );
    }
  });

  it("Remove a movie with the correct authority", async () => {
    // Send transaction to remove the movie
    const tx = await removeMovie(creators.a, moviePDA);

    console.log(`Signature: ${tx}`);

    // Get the movie data from program account but it's fail because the movie has been deleted
    try {
      await program.account.movie.fetch(moviePDA);
    } catch (err) {
      assert.strictEqual(
        err.message,
        `Account does not exist or has no data ${moviePDA.toBase58()}`
      );
    }
  });

  it("Transfer a movie to new another creator", async () => {
    const random = getRandomNumber();
    const [pda] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("movie"),
        new Uint8Array([random]),
        creators.a.publicKey.toBuffer(),
      ],
      program.programId
    );

    const [newPda] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("movie"),
        new Uint8Array([random]),
        creators.b.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Create movie before transfer
    const signature = await createMovie(creators.a, pda, random, movieData);

    console.log(`Signature: ${signature}`);

    // Send transaction to transfer the movie to another creator
    const tx = await program.methods
      .transfer()
      .accounts({
        authority: creators.a.publicKey,
        newAuthority: creators.b.publicKey,
        moviePda: pda,
        newMoviePda: newPda,
      })
      .signers([creators.a])
      .rpc();

    console.log(`Signature: ${tx}`);

    const [newMoviePDA] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("movie"),
        new Uint8Array([random]),
        creators.b.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Get the movie data to verify if the current authority is the creator B
    const data = await program.account.movie.fetch(newMoviePDA);

    assert.strictEqual(
      data.authority.toString(),
      creators.b.publicKey.toString()
    );
  });
});
