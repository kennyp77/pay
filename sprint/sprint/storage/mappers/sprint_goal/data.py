from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper

from pay.sprint.sprint.storage.db.tables import sprint_goals as t_sprint_goals
from pay.sprint.sprint.storage.entities.sprint_goal import SprintGoal


class SprintGoalDataMapper(SelectableDataMapper):
    entity_class = SprintGoal
    selectable = t_sprint_goals


class SprintGoalDataDumper(TableDataDumper):
    entity_class = SprintGoal
    table = t_sprint_goals
