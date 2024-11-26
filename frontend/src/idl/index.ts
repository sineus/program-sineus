/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_movie.json`.
 */
export type SolanaMovie = {
  address: "2to1m9qHAKQ8WdcKdKAhZJm6UkFACPgLqso3FPsuHe3M";
  metadata: {
    name: "solanaMovie";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "create";
      discriminator: [24, 30, 200, 40, 5, 28, 7, 119];
      accounts: [
        {
          name: "creator";
          docs: ["CHECK"];
          writable: true;
          signer: true;
        },
        {
          name: "movie";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "title";
          type: "string";
        },
        {
          name: "description";
          type: "string";
        },
        {
          name: "cover";
          type: "string";
        },
        {
          name: "year";
          type: "u64";
        },
        {
          name: "director";
          type: "string";
        },
        {
          name: "actors";
          type: {
            vec: "string";
          };
        },
        {
          name: "duration";
          type: "u16";
        },
        {
          name: "budget";
          type: "u64";
        },
        {
          name: "randomNumber";
          type: "u8";
        }
      ];
    },
    {
      name: "remove";
      discriminator: [199, 186, 9, 79, 96, 129, 24, 106];
      accounts: [
        {
          name: "authority";
          docs: ["CHECK"];
          writable: true;
          signer: true;
        },
        {
          name: "moviePda";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "transfer";
      discriminator: [163, 52, 200, 231, 140, 3, 69, 186];
      accounts: [
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "newAuthority";
        },
        {
          name: "moviePda";
          writable: true;
        },
        {
          name: "newMoviePda";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "update";
      discriminator: [219, 200, 88, 176, 158, 63, 253, 127];
      accounts: [
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "moviePda";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "title";
          type: "string";
        },
        {
          name: "description";
          type: "string";
        },
        {
          name: "cover";
          type: "string";
        },
        {
          name: "year";
          type: "u64";
        },
        {
          name: "director";
          type: "string";
        },
        {
          name: "actors";
          type: {
            vec: "string";
          };
        },
        {
          name: "duration";
          type: "u16";
        },
        {
          name: "budget";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "movie";
      discriminator: [222, 96, 145, 199, 237, 196, 205, 180];
    }
  ];
  events: [
    {
      name: "movieCreated";
      discriminator: [99, 29, 223, 19, 194, 42, 182, 5];
    },
    {
      name: "movieRemoved";
      discriminator: [49, 165, 125, 0, 254, 251, 245, 129];
    },
    {
      name: "movieTransfered";
      discriminator: [42, 222, 70, 138, 239, 207, 18, 99];
    },
    {
      name: "movieUpdated";
      discriminator: [30, 128, 121, 198, 78, 223, 46, 239];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "stringTooLong";
      msg: "String is too long";
    },
    {
      code: 6001;
      name: "titleTooLong";
      msg: "Title is too long";
    },
    {
      code: 6002;
      name: "descriptionTooLong";
      msg: "Description is too long";
    },
    {
      code: 6003;
      name: "coverTooLong";
      msg: "Cover is too long";
    },
    {
      code: 6004;
      name: "directorTooLong";
      msg: "Director is too long";
    },
    {
      code: 6005;
      name: "tooManyActors";
      msg: "Too many actors";
    },
    {
      code: 6006;
      name: "invalidPda";
      msg: "Invalid PDA for the movie";
    },
    {
      code: 6007;
      name: "unauthorizedAccess";
      msg: "Unauthorized access, you're not the creator of this movie";
    }
  ];
  types: [
    {
      name: "movie";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "cover";
            type: "string";
          },
          {
            name: "title";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "year";
            type: "u64";
          },
          {
            name: "director";
            type: "string";
          },
          {
            name: "duration";
            type: "u16";
          },
          {
            name: "actors";
            type: {
              vec: "string";
            };
          },
          {
            name: "budget";
            type: "u64";
          },
          {
            name: "randomNumber";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "movieCreated";
      type: {
        kind: "struct";
        fields: [
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "randomNumber";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "movieRemoved";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "randomNumber";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "movieTransfered";
      type: {
        kind: "struct";
        fields: [
          {
            name: "newAuthority";
            type: "pubkey";
          },
          {
            name: "randomNumber";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "movieUpdated";
      type: {
        kind: "struct";
        fields: [
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "randomNumber";
            type: "u8";
          }
        ];
      };
    }
  ];
  constants: [
    {
      name: "movieSeed";
      type: "string";
      value: '"movie"';
    }
  ];
};
