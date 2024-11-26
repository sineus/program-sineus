use anchor_lang::prelude::*;

#[account]
pub struct Movie {
    pub authority: Pubkey,
    pub cover: String,
    pub title: String,
    pub description: String,
    pub year: u64,
    pub director: String,
    pub duration: u16,
    pub actors: Vec<String>,
    pub budget: u64,
    pub random_number: u8,
}

impl Movie {
    pub const COVER_LENGTH: usize = 100; // URL de l'image
    pub const TITLE_LENGTH: usize = 50; // Titre du film
    pub const DESCRIPTION_LENGTH: usize = 500; // Description
    pub const DIRECTOR_LENGTH: usize = 50; // Nom du directeur
    pub const ACTOR_NAME_LENGTH: usize = 50; // Longueur max pour chaque nom d'acteur
    pub const MAX_ACTORS: usize = 10; // Nombre maximum d'acteurs

    pub const SIZE: usize = 8 +  // Discriminator
        32 +                             // Authority public key
        (4 + Self::COVER_LENGTH) +       // String cover (4 pour la taille + contenu)
        (4 + Self::TITLE_LENGTH) +       // String title
        (4 + Self::DESCRIPTION_LENGTH) + // String description
        8 +                              // u64 year
        (4 + Self::DIRECTOR_LENGTH) +    // String director
        2 +                              // u16 duration
        4 + (Self::MAX_ACTORS *          // Vec<String> actors (4 pour la taille du Vec)
            (4 + Self::ACTOR_NAME_LENGTH)) + // Chaque String dans le Vec
        8 +                                 // u64 budget
        1; // u8 random number

    pub fn get_space() -> usize {
        Self::SIZE
    }
}

#[event]
pub struct MovieCreated {
    pub creator: Pubkey,
    pub random_number: u8,
}

#[event]
pub struct MovieUpdated {
    pub creator: Pubkey,
    pub random_number: u8,
}

#[event]
pub struct MovieRemoved {
    pub authority: Pubkey,
    pub random_number: u8,
}

#[event]
pub struct MovieTransfered {
    pub new_authority: Pubkey,
    pub random_number: u8,
}
