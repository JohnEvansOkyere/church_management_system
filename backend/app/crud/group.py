from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.group import Group, GroupMember
from app.models.member import Member
from app.schemas.group import GroupCreate, GroupUpdate


def list_groups(db: Session, include_inactive: bool = False) -> list[Group]:
    query = db.query(Group)
    if not include_inactive:
        query = query.filter(Group.is_active.is_(True))
    return query.order_by(Group.name.asc()).all()


def get_group(db: Session, group_id: UUID) -> Group | None:
    return db.query(Group).filter(Group.id == group_id).first()


def group_member_count(db: Session, group_id: UUID) -> int:
    return int(
        db.query(func.count(GroupMember.id))
        .join(Member, Member.id == GroupMember.member_id)
        .filter(GroupMember.group_id == group_id, Member.membership_status == "active")
        .scalar()
        or 0
    )


def create_group(db: Session, payload: GroupCreate) -> Group:
    group = Group(**payload.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


def update_group(db: Session, group_id: UUID, payload: GroupUpdate) -> Group | None:
    group = get_group(db, group_id)
    if not group:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(group, field, value)
    db.commit()
    db.refresh(group)
    return group


def deactivate_group(db: Session, group_id: UUID) -> bool:
    group = get_group(db, group_id)
    if not group:
        return False
    group.is_active = False
    db.commit()
    return True


def list_group_members(db: Session, group_id: UUID) -> list[GroupMember]:
    return (
        db.query(GroupMember)
        .join(Member, Member.id == GroupMember.member_id)
        .filter(GroupMember.group_id == group_id)
        .order_by(Member.first_name.asc(), Member.last_name.asc())
        .all()
    )


def add_member(db: Session, group_id: UUID, member_id: UUID) -> GroupMember:
    membership = GroupMember(group_id=group_id, member_id=member_id)
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


def remove_member(db: Session, group_id: UUID, member_id: UUID) -> bool:
    membership = (
        db.query(GroupMember)
        .filter(GroupMember.group_id == group_id, GroupMember.member_id == member_id)
        .first()
    )
    if not membership:
        return False
    db.delete(membership)
    db.commit()
    return True
