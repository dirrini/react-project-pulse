import { gql } from "@apollo/client";

export const TIMELINE_PROJECTS_QUERY = gql`
  query TimelineProjects {
    timelineProjects {
      id
      name
      description
      progress
      status
      users {
        id
        name
        email
        role
      }
      tasks {
        id
        title
        description
        status
        projectId
        users {
          id
          status
          estimatedStartDate
          estimatedEndDate
          user {
            id
            name
            email
            role
          }
        }
      }
    }
  }
`;
