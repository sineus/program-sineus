use anchor_lang::prelude::*;

use crate::{
    error::MovieError,
    state::{Movie, MovieUpdated},
    MOVIE_SEED,
};

pub fn update_movie(
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
    let movie_account = &mut ctx.accounts.movie_pda;

    movie_account.title = title;
    movie_account.description = description;
    movie_account.cover = cover;
    movie_account.year = year;
    movie_account.director = director;
    movie_account.actors = actors;
    movie_account.duration = duration;
    movie_account.budget = budget;

    msg!("{:?}", movie_account.key());

    emit!(MovieUpdated {
        creator: ctx.accounts.authority.key().clone(),
        random_number: movie_account.random_number.clone(),
    });

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    title: String,
    description: String,
    cover: String,
    year: u64,
    director: String,
    actors: Vec<String>,
)]
pub struct UpdateMovie<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [
            MOVIE_SEED.as_bytes(),
            &[movie_pda.random_number],
            authority.key().as_ref()
        ],
        bump,
        constraint = movie_pda.authority == authority.key() @ MovieError::UnauthorizedAccess,
        constraint = title.as_bytes().len() <= Movie::TITLE_LENGTH @ MovieError::TitleTooLong,
        constraint = description.as_bytes().len() <= Movie::DESCRIPTION_LENGTH @ MovieError::DescriptionTooLong,
        constraint = cover.as_bytes().len() <= Movie::COVER_LENGTH @ MovieError::CoverTooLong,
        constraint = director.as_bytes().len() <= Movie::DIRECTOR_LENGTH @ MovieError::DirectorTooLong,
        constraint = actors.len() <= Movie::MAX_ACTORS @ MovieError::TooManyActors,
    )]
    pub movie_pda: Account<'info, Movie>,
    pub system_program: Program<'info, System>,
}
