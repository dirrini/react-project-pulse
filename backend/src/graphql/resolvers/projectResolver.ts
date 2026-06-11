export const projectResolver = {
  Query: {
    projects: () => [
      {
        id: "1",
        name: "CRM Migration",
        description:
          "Migrating legacy CRM system",
        progress: 72
      },
      {
        id: "2",
        name: "Mobile App Redesign",
        description:
          "Modernizing the mobile UX",
        progress: 45
      },
      {
        id: "3",
        name: "OCI Cloud Migration",
        description:
          "Moving workloads to Oracle Cloud",
        progress: 90
      }
    ]
  }
};