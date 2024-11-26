use anchor_lang::prelude::*;

#[error_code]
pub enum MovieError {
    #[msg("String is too long")]
    StringTooLong,
    #[msg("Title is too long")]
    TitleTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Cover is too long")]
    CoverTooLong,
    #[msg("Director is too long")]
    DirectorTooLong,
    #[msg("Too many actors")]
    TooManyActors,
    #[msg("Invalid PDA for the movie")]
    InvalidPDA,
    #[msg("Unauthorized access, you're not the creator of this movie")]
    UnauthorizedAccess,
}
