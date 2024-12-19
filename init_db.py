from app import app
from app import db
import schema

with app.app_context():
    db.drop_all()
    db.create_all()

    db.session.begin()

    db.session.add_all(
        [
            schema.Role(
                name="Sovereign"
            ),
            schema.Role(
                name="Sheperd"
            ),
            schema.Role(
                name="Matriarch"
            ),
            schema.Role(
                name="Acolyte"
            ),
        ]
    )

    db.session.add_all(
        [
            schema.Item(
                user_id=1,
                name="Half-grow",
                description="Progresses your dinosaur growth stage to half. Using it from hatchling age will make your dinosaur a sub-adult.",
                count=27
            ),
            schema.Item(
                user_id=1,
                name="Elder",
                description="Elders your dinosaur and applies additional combat weight, health and stamina.",
                count=50
            ),
            schema.Item(
                user_id=1,
                name="Grand Plains Teleport",
                description="Teleports your dinosaur into the Grand Plains area.",
                count=15
            ),
            schema.Item(
                user_id=1,
                name="Dried Lake Teleport",
                description="Teleports your dinosaur into the Dried Lake area.",
                count=15
            ),
        ]
    )

    db.session.add_all(
        [
            schema.Mutation(
                user_id=1,
                type=schema.MutationType.Armour,
                stars_count=1
            ),
            schema.Mutation(
                user_id=1,
                type=schema.MutationType.Armour,
                stars_count=3,
                is_upgraded=True
            ),
            schema.Mutation(
                user_id=1,
                type=schema.MutationType.Combat,
                stars_count=5,
                is_active=True
            ),
        ]
    )

    user = schema.User(
        name="Username",
        dna_amount=283,
        rna_amount=3257,
        stardust_amount=207,
        active_role_id=1,
    )
    db.session.add(user)

    db.session.add_all(
        [
            schema.UserRoles(
                user_id=1,
                role_id=1
            ),
            schema.UserRoles(
                user_id=1,
                role_id=2
            ),
            schema.UserRoles(
                user_id=1,
                role_id=3
            ),
            schema.UserRoles(
                user_id=1,
                role_id=4
            ),
        ]
    )

    db.session.commit()