from sendr_aiohttp import Url

from pay.sprint.sprint.api.handlers.projects import ProjectsHandler
from pay.sprint.sprint.api.handlers.sprint_goal import SprintGoalHandler
from pay.sprint.sprint.api.handlers.sprint_goals import SprintGoalsHandler
from pay.sprint.sprint.api.handlers.sprint_resources import SprintResourcesHandler
from pay.sprint.sprint.api.handlers.sprints import SprintsHandler
from pay.sprint.sprint.api.handlers.stories import StoriesHandler

WEB_ROUTES = (
    Url(r'/api/v1/projects', ProjectsHandler, name='v1_projects'),
    Url(r'/api/v1/sprints', SprintsHandler, name='v1_sprints'),
    Url(r'/api/v1/stories', StoriesHandler, name='v1_stories'),
    Url(r'/api/v1/sprints/{sprint_id:[^/]+}/goals', SprintGoalsHandler, name='v1_sprint_goals'),
    Url(r'/api/v1/sprints/{sprint_id:[^/]+}/goals/{sprint_goal_id:[^/]+}', SprintGoalHandler, name='v1_sprint_goal'),
    Url(r'/api/v1/sprint-resources', SprintResourcesHandler, name='v1_sprint_resources'),
)
