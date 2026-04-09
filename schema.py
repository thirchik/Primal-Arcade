import enum
from app import db
from sqlalchemy import Enum
from sqlalchemy.orm import Mapped, relationship

@enum.unique
class MutationType(int, enum.Enum):
    Combat: int = 1
    Armour: int = 2

class Role(db.Model):
    __tablename__ = 'roles'
    id: Mapped[int] = db.Column(db.Integer, primary_key=True)
    name: Mapped[str] = db.Column(db.String(255), nullable=False)
    color: Mapped[str] = db.Column(db.String(9), nullable=False, default='#FFFFFFFF')

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Item(db.Model):
    __tablename__ = 'items'
    id: Mapped[int] = db.Column(db.Integer, primary_key=True)
    user_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name: Mapped[str] = db.Column(db.String(255), nullable=False)
    description: Mapped[str] = db.Column(db.String(1024), nullable=False)
    count: Mapped[str] = db.Column(db.SmallInteger, nullable=False, default=1)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Mutation(db.Model):
    __tablename__ = 'mutations'
    id: Mapped[int] = db.Column(db.Integer, primary_key=True)
    user_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type: Mapped[MutationType] = db.Column(Enum(MutationType), nullable=False)
    stars_count: Mapped[int] = db.Column(db.Integer, nullable=False)
    is_active: Mapped[bool] = db.Column(db.Boolean, nullable=False, default=False)
    is_upgraded: Mapped[bool] = db.Column(db.Boolean, nullable=False, default=False)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class User(db.Model):
    __tablename__ = 'users'
    id: Mapped[int] = db.Column(db.Integer, primary_key=True)
    name: Mapped[str] = db.Column(db.String(255), nullable=False)
    dna_amount: Mapped[int] = db.Column(db.Integer, nullable=False, default=0)
    rna_amount: Mapped[int] = db.Column(db.Integer, nullable=False, default=0)
    stardust_amount: Mapped[int] = db.Column(db.Integer, nullable=False, default=0)
    active_role_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=True)
    active_role: Mapped['Role'] = relationship('Role')
    roles: Mapped[list['Role']] = relationship('Role', secondary='user_roles')
    items: Mapped[list['Item']] = relationship('Item')
    mutations: Mapped[list['Mutation']] = relationship('Mutation')

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id: Mapped[int] = db.Column(db.Integer, primary_key=True)
    user_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
