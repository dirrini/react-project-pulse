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

export const PROJECT_QUERY = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id
      name
      description
      progress
      status
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
      users {
        id
        name
        email
        role
      }
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

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
      progress
      status
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
      users {
        id
        name
        email
        role
      }
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
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
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
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
`;

export const ADD_PROJECT_USER_MUTATION = gql`
  mutation AddProjectUser($input: AddProjectUserInput!) {
    addProjectUser(input: $input) {
      id
      users {
        id
        name
        email
        role
      }
    }
  }
`;

export const REMOVE_PROJECT_USER_MUTATION = gql`
  mutation RemoveProjectUser($input: RemoveProjectUserInput!) {
    removeProjectUser(input: $input) {
      id
      users {
        id
        name
        email
        role
      }
    }
  }
`;
