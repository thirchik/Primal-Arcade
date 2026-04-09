from random import randint
from schema import Mutation, MutationType, User
from app import db

def get_default_user():
    return db.session.query(User).where(User.id == 1).first()

MAX_CHANCE = 100
DNA_SPIN_COST = 1
STARDUST_SPIN_COST = 10
MUTATIOM_UPGRADE_COST = 200

def get_spin_result(chances_dict: dict[int, int]):
    chances = list(chances_dict.keys())
    chances.sort(reverse=True)
    
    chances_sum = sum(chances);
    if chances_sum > MAX_CHANCE or chances_sum < MAX_CHANCE:
        raise Exception(f'Chances sum must be {MAX_CHANCE}. Current sum is: {chances_sum}')
    
    result = randint(0, MAX_CHANCE)

    total_chance = 0
    for chance in chances:
        total_chance += chance
        if result <= total_chance:
            return chances_dict[chance]

    return -1

def get_random_mutation_type():
    return MutationType.Armour if randint(0, 1) == 0 else MutationType.Combat

chances_dict_dna = {
    35: 1,
    25: 2,
    20: 3,
    15: 4,
    5: 5
}

chances_dict_stardust = {
    50: 3,
    30: 4,
    15: 5,
    5: 6
}

def spin_dna(user_id: int):
    type = get_random_mutation_type()
    stars_count = get_spin_result(chances_dict_dna)
    return Mutation(
        user_id=user_id,
        type=type,
        stars_count=stars_count
    )

def spin_stardust(user_id: int):
    type = get_random_mutation_type()
    stars_count = get_spin_result(chances_dict_stardust)
    return Mutation(
        user_id=user_id,
        type=type,
        stars_count=stars_count
    )
