pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;

declare_id!("2to1m9qHAKQ8WdcKdKAhZJm6UkFACPgLqso3FPsuHe3M");

#[program]
pub mod solana_movie {
    use super::*;

    pub fn create(
        ctx: Context<CreateMovie>,
        title: String,
        description: String,
        cover: String,
        year: u64,
        director: String,
        actors: Vec<String>,
        duration: u16,
        budget: u64,
        random_number: u8,
    ) -> Result<()> {
        instructions::create_movie(
            ctx,
            title,
            description,
            cover,
            year,
            director,
            actors,
            duration,
            budget,
            random_number,
        )
    }

    pub fn update(
        ctx: Context<UpdateMovie>,
        title: String,
        description: String,
        cover: String,
        year: u64,
        director: String,
        actors: Vec<String>,
        duration: u16,
        budget: u64,
    ) -> Result<()> {
        instructions::update_movie(
            ctx,
            title,
            description,
            cover,
            year,
            director,
            actors,
            duration,
            budget,
        )
    }

    pub fn remove(ctx: Context<RemoveMovie>) -> Result<()> {
        instructions::remove_movie(ctx)
    }

    pub fn transfer(ctx: Context<TransferMovie>) -> Result<()> {
        instructions::transfer_movie(ctx)
    }
}
