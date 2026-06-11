export const dashboardResolver = {
  Query: {
    dashboardStats: () => ({
      totalProjects: 3,
      totalTasks: 84,
      completedTasks: 61,
      teamMembers: 8
    })
  }
};