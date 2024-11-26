use anchor_lang::prelude::*;

use crate::{
    error::MovieError,
    state::{Movie, MovieTransfered},
    MOVIE_SEED,
};

pub fn transfer_movie(ctx: Context<TransferMovie>) -> Result<()> {
    let movie_account = &mut ctx.accounts.movie_pda;
    let new_movie_account = &mut ctx.accounts.new_movie_pda;

    new_movie_account.authority = ctx.accounts.new_authority.key();
    new_movie_account.title = movie_account.title.clone();
    new_movie_account.description = movie_account.description.clone();
    new_movie_account.cover = movie_account.cover.clone();
    new_movie_account.year = movie_account.year.clone();
    new_movie_account.director = movie_account.director.clone();
    new_movie_account.actors = movie_account.actors.clone();
    new_movie_account.duration = movie_account.duration.clone();
    new_movie_account.budget = movie_account.budget.clone();
    new_movie_account.random_number = movie_account.random_number.clone();

    let destination = ctx.accounts.authority.to_account_info();
    let source = movie_account.to_account_info();

    **destination.try_borrow_mut_lamports()? += source.lamports();
    **source.try_borrow_mut_lamports()? = 0;

    emit!(MovieTransfered {
        new_authority: ctx.accounts.new_authority.key().clone(),
        random_number: movie_account.random_number.clone(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct TransferMovie<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: This is the new authority of movie
    pub new_authority: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [
            MOVIE_SEED.as_bytes(),
            &[movie_pda.random_number],
            authority.key().as_ref()
        ],
        bump,
        constraint = movie_pda.authority == authority.key() @ MovieError::UnauthorizedAccess,
    )]
    pub movie_pda: Account<'info, Movie>,
    #[account(
        init,
        payer = authority,
        space = Movie::SIZE,
        seeds = [
            MOVIE_SEED.as_bytes(),
            &[movie_pda.random_number],
            new_authority.key().as_ref()
        ],
        bump,
    )]
    pub new_movie_pda: Account<'info, Movie>,
    pub system_program: Program<'info, System>,
}
