import { gql } from "@apollo/client";

export const PROJECTS_QUERY = gql`
  query Projects {
    projects {
      id
      name
      description
      progress
      status
    }
  }
`;

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      progress
      status
    }
  }
`;
