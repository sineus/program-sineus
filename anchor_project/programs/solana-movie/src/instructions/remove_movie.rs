use anchor_lang::prelude::*;

use crate::{
    error::MovieError,
    state::{Movie, MovieRemoved},
    MOVIE_SEED,
};

pub fn remove_movie(ctx: Context<RemoveMovie>) -> Result<()> {
    emit!(MovieRemoved {
        authority: ctx.accounts.authority.key().clone(),
        random_number: ctx.accounts.movie_pda.random_number.clone(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct RemoveMovie<'info> {
    /// CHECK
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        close = authority,
        seeds = [
            MOVIE_SEED.as_bytes(),
            &[movie_pda.random_number],
            authority.key().as_ref()
        ],
        bump,
        constraint = movie_pda.authority == authority.key() @ MovieError::UnauthorizedAccess
    )]
    pub movie_pda: Account<'info, Movie>,
    pub system_program: Program<'info, System>,
}
