use anchor_lang::prelude::*;

use crate::{error::MovieError, state::{Movie, MovieCreated}, MOVIE_SEED};

pub fn create_movie(
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
    let movie_account = &mut ctx.accounts.movie;

    movie_account.authority = ctx.accounts.creator.key();
    movie_account.title = title;
    movie_account.description = description;
    movie_account.cover = cover;
    movie_account.year = year;
    movie_account.director = director;
    movie_account.actors = actors;
    movie_account.duration = duration;
    movie_account.budget = budget;
    movie_account.random_number = random_number;

    msg!("{:?}", movie_account.key());

    emit!(MovieCreated {
        creator: ctx.accounts.creator.key().clone(),
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
    duration: u16,
    budget: u64,
    random_number: u8
)]
pub struct CreateMovie<'info> {
    /// CHECK
    #[account(mut, signer)]
	pub creator: AccountInfo<'info>,

    #[account(
        init, 
        payer = creator,
        space = Movie::SIZE,
        seeds = [
            MOVIE_SEED.as_bytes(),
            &[random_number],
            creator.key().as_ref()
        ],
        bump,
        constraint = title.as_bytes().len() <= Movie::TITLE_LENGTH @ MovieError::TitleTooLong,
        constraint = description.as_bytes().len() <= Movie::DESCRIPTION_LENGTH @ MovieError::DescriptionTooLong,
        constraint = cover.as_bytes().len() <= Movie::COVER_LENGTH @ MovieError::CoverTooLong,
        constraint = director.as_bytes().len() <= Movie::DIRECTOR_LENGTH @ MovieError::DirectorTooLong,
        constraint = actors.len() <= Movie::MAX_ACTORS @ MovieError::TooManyActors,
    )]
    pub movie: Account<'info, Movie>,
    pub system_program: Program<'info, System>
}