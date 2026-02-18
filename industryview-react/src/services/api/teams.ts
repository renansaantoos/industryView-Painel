/**
 * Teams API - Re-exported from projects.ts for convenience.
 * The teams endpoints in the Flutter app were under the ProjectsGroup.
 * We keep them available from both paths.
 */
export {
  queryAllTeams,
  getTeam,
  addTeam,
  editTeam,
  deleteTeam,
  queryAllTeamMembers,
  getTeamMember,
  addTeamMember,
  editTeamMember,
  deleteTeamMember,
  queryAllTeamLeaders,
  getTeamLeader,
  addTeamLeader,
  editTeamLeader,
  deleteTeamLeader,
  listTeamProjects,
  checkTeamConflicts,
  linkTeamToProject,
  unlinkTeamFromProject,
  getTeamProjectHistory,
  getTeamMembersHistory,
} from './projects';
