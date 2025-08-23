# Users All Information Feature

This feature provides access to comprehensive user information including their projects, teams, and roles across all pages of the application.

## Features

- **Redux State Management**: Centralized state for all users information
- **Auto-fetching**: Automatically fetches data when components mount
- **Error Handling**: Built-in error handling and retry functionality
- **Loading States**: Loading indicators during API calls
- **Reusable Hook**: Easy to use hook for any component
- **Individual User Info**: Fetch complete information for specific users

## Usage

### 1. Using the Hook in Any Component

```tsx
import { useUsersAllInformation } from '../../features/users';

function MyComponent() {
  const { allUsersInformation, loading, error, fetchUsers } = useUsersAllInformation();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {allUsersInformation.map(user => (
        <div key={user.id}>
          <h3>{user.firstName} {user.lastName}</h3>
          <p>Email: {user.email}</p>
          <p>Department: {user.department}</p>
          
          {/* Projects */}
          <div>
            <h4>Projects:</h4>
            {user.projects.map(project => (
              <span key={project.id}>{project.name}</span>
            ))}
          </div>
          
          {/* Teams */}
          <div>
            <h4>Teams:</h4>
            {user.teams.map(team => (
              <span key={team.id}>{team.name}</span>
            ))}
          </div>
          
          {/* Roles */}
          <div>
            <h4>Roles:</h4>
            {user.roles.map(role => (
              <span key={role.id}>{role.name} ({role.level})</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 2. Using the Pre-built Component

```tsx
import { UsersInfoDisplay } from '../../components/Common/UsersInfoDisplay';

function MyPage() {
  return (
    <div>
      <h1>Users Overview</h1>
      
      {/* Show all information */}
      <UsersInfoDisplay />
      
      {/* Or customize what to show */}
      <UsersInfoDisplay 
        showProjects={true}
        showTeams={false}
        showRoles={true}
      />
    </div>
  );
}
```

### 3. Manual Control (Disable Auto-fetch)

```tsx
import { useUsersAllInformation } from '../../features/users';

function MyComponent() {
  // Disable auto-fetch on mount
  const { allUsersInformation, loading, error, fetchUsers } = useUsersAllInformation(false);

  return (
    <div>
      <button onClick={fetchUsers}>Load Users</button>
      {/* Rest of your component */}
    </div>
  );
}
```

### 4. Getting Complete Information for a Specific User

```tsx
import { useUserCompleteInformation } from '../../features/users';

function UserProfile() {
  const { userCompleteInformation, loading, error, fetchUserInfo } = useUserCompleteInformation();

  if (loading) return <div>Loading user profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userCompleteInformation) return <div>No user data</div>;

  const user = userCompleteInformation;

  return (
    <div>
      <h2>{user.firstName} {user.lastName}</h2>
      <p>Email: {user.email}</p>
      <p>Department: {user.department}</p>
      
      {/* Access detailed user information */}
      <div>
        <h3>Projects ({user.projects.length})</h3>
        {user.projects.map(project => (
          <div key={project.id}>
            <strong>{project.name}</strong> - {project.status}
          </div>
        ))}
      </div>
      
      <div>
        <h3>Teams ({user.teams.length})</h3>
        {user.teams.map(team => (
          <div key={team.id}>
            <strong>{team.name}</strong>
          </div>
        ))}
      </div>
      
      <div>
        <h3>Roles ({user.roles.length})</h3>
        {user.roles.map(role => (
          <div key={role.id}>
            <strong>{role.name}</strong> - Level: {role.level}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5. Using the Pre-built User Complete Info Component

```tsx
import { UserCompleteInfoDisplay } from '../../components/Common/UserCompleteInfoDisplay';

function UserPage() {
  return (
    <div>
      <h1>User Profile</h1>
      
      {/* Show all user information */}
      <UserCompleteInfoDisplay />
      
      {/* Or customize what to show */}
      <UserCompleteInfoDisplay 
        showProjects={true}
        showTeams={false}
        showRoles={true}
      />
    </div>
  );
}
```

## API Endpoints

The feature calls the following endpoints:

### All Users Information
```
GET http://localhost:3000/users/all-information
Authorization: Bearer YOUR_JWT_TOKEN
```

### Specific User Complete Information
```
GET http://localhost:3000/users/USER_ID/complete-information
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Structure

```typescript
interface UserAllInformation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  employeeId: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    code: string;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  teams: Array<{
    id: string;
    name: string;
    description: string;
    leadId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  roles: Array<{
    id: string;
    name: string;
    description: string;
    level: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    permissionIds: string[];
  }>;
}
```

## Redux State

The feature adds the following to the Redux store:

```typescript
interface UsersState {
  selectedUser: User | null;
  allUsersInformation: UserAllInformation[]; // All users
  userCompleteInformation: UserAllInformation | null; // Specific user
  loading: boolean;
  error: string | null;
}
```

## Available Actions

- `fetchAllUsersInformation()` - Async thunk to fetch all users information
- `fetchUserCompleteInformation(userId)` - Async thunk to fetch specific user info
- `setAllUsersInformation(data)` - Set users information manually
- `setLoading(boolean)` - Set loading state
- `setError(string | null)` - Set error state

## Available Selectors

- `selectAllUsersInformation(state)` - Get all users information
- `selectUserCompleteInformation(state)` - Get specific user information
- `selectUsersLoading(state)` - Get loading state
- `selectUsersError(state)` - Get error state

## Available Hooks

- `useUsersAllInformation(autoFetch?)` - Hook for all users data
- `useUserCompleteInformation(userId, autoFetch?)` - Hook for specific user data

## Benefits

1. **Centralized Data**: All user information is stored in one place
2. **Reusable**: Can be used across any page or component
3. **Automatic**: Fetches data automatically when needed
4. **Efficient**: Avoids duplicate API calls
5. **Type Safe**: Full TypeScript support
6. **Error Resilient**: Built-in error handling and retry
7. **Flexible**: Can fetch all users or specific user data
8. **Real-time**: Data is always up-to-date with the latest API calls
