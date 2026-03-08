"""add workout_sessions workout_exercises sets tables

Revision ID: b7e8c4a1f3d2
Revises: 0483435f322d
Create Date: 2026-03-08

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b7e8c4a1f3d2'
down_revision = '0483435f322d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'workout_sessions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'date', name='uq_workout_sessions_user_date'),
    )
    op.create_index(op.f('ix_workout_sessions_user_id'), 'workout_sessions', ['user_id'], unique=False)

    op.create_table(
        'workout_exercises',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('exercise_id', sa.Integer(), nullable=False),
        sa.Column('order', sa.Integer(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['workout_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['exercise_id'], ['exercises.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_workout_exercises_session_id'), 'workout_exercises', ['session_id'], unique=False)
    op.create_index(op.f('ix_workout_exercises_exercise_id'), 'workout_exercises', ['exercise_id'], unique=False)

    op.create_table(
        'sets',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('workout_exercise_id', sa.Integer(), nullable=False),
        sa.Column('set_number', sa.Integer(), nullable=False),
        sa.Column('reps', sa.Integer(), nullable=False),
        sa.Column('weight', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('rest_seconds', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['workout_exercise_id'], ['workout_exercises.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_sets_workout_exercise_id'), 'sets', ['workout_exercise_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_sets_workout_exercise_id'), table_name='sets')
    op.drop_table('sets')
    op.drop_index(op.f('ix_workout_exercises_exercise_id'), table_name='workout_exercises')
    op.drop_index(op.f('ix_workout_exercises_session_id'), table_name='workout_exercises')
    op.drop_table('workout_exercises')
    op.drop_index(op.f('ix_workout_sessions_user_id'), table_name='workout_sessions')
    op.drop_table('workout_sessions')
