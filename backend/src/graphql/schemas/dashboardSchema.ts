export const dashboardSchema = `#graphql

  type DashboardStats {
    totalProjects: Int!
    totalTasks: Int!
    completedTasks: Int!
    teamMembers: Int!
  }

  extend type Query {
    dashboardStats: DashboardStats!
  }

`;