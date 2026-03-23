"""add workout templates tables

Revision ID: 0c542f366960
Revises: b7e8c4a1f3d2
Create Date: 2026-03-22 23:17:01.277855

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0c542f366960'
down_revision = 'b7e8c4a1f3d2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('workout_templates',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sqlite_autoincrement=True
    )
    op.create_index(op.f('ix_workout_templates_user_id'), 'workout_templates', ['user_id'], unique=False)
    op.create_table('template_exercises',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('template_id', sa.Integer(), nullable=False),
    sa.Column('exercise_id', sa.Integer(), nullable=False),
    sa.Column('target_sets', sa.Integer(), nullable=False),
    sa.Column('target_reps', sa.Integer(), nullable=False),
    sa.Column('order', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['exercise_id'], ['exercises.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['template_id'], ['workout_templates.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sqlite_autoincrement=True
    )
    op.create_index(op.f('ix_template_exercises_exercise_id'), 'template_exercises', ['exercise_id'], unique=False)
    op.create_index(op.f('ix_template_exercises_template_id'), 'template_exercises', ['template_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_template_exercises_template_id'), table_name='template_exercises')
    op.drop_index(op.f('ix_template_exercises_exercise_id'), table_name='template_exercises')
    op.drop_table('template_exercises')
    op.drop_index(op.f('ix_workout_templates_user_id'), table_name='workout_templates')
    op.drop_table('workout_templates')

