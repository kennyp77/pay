/* pgmigrate-encoding: utf-8 */
insert into sprint.projects (project_id, title, responsible_uid)
values ('10c5d126-8fae-4a6b-b8d8-71493b9f053c', 'Проект Манхэттен', 1120000000148382);

insert into sprint.stories (story_id, project_id, title, responsible_uid)
values ('a3aa97b2-e6a8-4fad-8d84-a77c9b2d1f03', '10c5d126-8fae-4a6b-b8d8-71493b9f053c', 'Утиная история', 1120000000148382);

insert into sprint.sprints (sprint_id, starts_at, ends_at, title)
values ('c483d839-ccd5-431e-bfc7-843bb5677623', '2022-05-16T00:00:00+00:00', '2022-05-22T00:00:00', '300 метров');

insert into sprint.sprint_goals (sprint_goal_id, title, sprint_id)
values ('a1167aaf-355b-42ef-a616-8d0f340a0d3a', 'Начать да закончить', 'c483d839-ccd5-431e-bfc7-843bb5677623');


insert into sprint.resource_types (resource_type_id, title, code)
values
('76e6301b-e67f-4a0d-ac71-ea1593006eac', 'Front', 'f')
,('db079db1-0dd3-4447-9c5d-0f07016eb859', 'Back', 'b')
,('0780e7ad-de72-42e2-a12c-fb3435639564', 'iOS Mob', 'i')
,('ad9a41ef-5619-4263-b4a2-40711f4fdf4e', 'Android Mob', 'a')
,('8cca1619-6e55-4389-866b-1ed11ad3b6ff', 'Менеджер', 'm')
,('f4093b87-c05f-462f-b0eb-05abfd77d4f4', 'Дизайнер', 'd')
,('755b513c-a073-4314-a60d-3f971539ddd7', 'Аналитик', 'n')
,('81b4e12f-bf7f-442a-b5ec-76f9a9a3edfe', 'Тестировщик', 't')
,('52228e23-4bc0-4a52-bd32-6e4bef2baffb', 'Архитектор (Ваня)', 'v')
,('6edac4ee-6324-41b7-883b-0d694bcc7b00', 'Маркетинг', 's')
,('57dac64a-e933-450a-b16f-580411ccc2dc', 'Биздевы', 'z')
;

insert into sprint.sprint_resources (sprint_resource_id, resource_type_id, sprint_id, amount)
values
('a1167aaf-355b-42ef-a616-8d0f340a0d3a', '76e6301b-e67f-4a0d-ac71-ea1593006eac', 'c483d839-ccd5-431e-bfc7-843bb5677623', '3.0')
,('98d5e841-1b05-4454-8491-4f2bc7a098f4', 'db079db1-0dd3-4447-9c5d-0f07016eb859', 'c483d839-ccd5-431e-bfc7-843bb5677623', '2.5')
,('4b82935f-e039-4718-af82-6fe2289f976b', 'f4093b87-c05f-462f-b0eb-05abfd77d4f4', 'c483d839-ccd5-431e-bfc7-843bb5677623', '1.0')
;

insert into sprint.sprint_story_resources (sprint_story_resource_id, resource_type_id, sprint_id, story_id, amount)
values
('a032b2f4-5ca9-4a23-a985-42fe6190db0f', '76e6301b-e67f-4a0d-ac71-ea1593006eac', 'c483d839-ccd5-431e-bfc7-843bb5677623', 'a3aa97b2-e6a8-4fad-8d84-a77c9b2d1f03', '120.0')
,('dc3eb0d8-e833-4755-bc30-6a43716bc5d9', 'db079db1-0dd3-4447-9c5d-0f07016eb859', 'c483d839-ccd5-431e-bfc7-843bb5677623', 'a3aa97b2-e6a8-4fad-8d84-a77c9b2d1f03', '40')
,('c401863b-f07f-4bb4-a9be-65535eeda05f', 'f4093b87-c05f-462f-b0eb-05abfd77d4f4', 'c483d839-ccd5-431e-bfc7-843bb5677623', 'a3aa97b2-e6a8-4fad-8d84-a77c9b2d1f03', '80')
;
