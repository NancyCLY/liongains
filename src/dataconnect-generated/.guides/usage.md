# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreatePublicRoutine, useListPublicRoutines, useCreateUserRoutine, useListUserRoutines } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreatePublicRoutine(createPublicRoutineVars);

const { data, isPending, isSuccess, isError, error } = useListPublicRoutines();

const { data, isPending, isSuccess, isError, error } = useCreateUserRoutine(createUserRoutineVars);

const { data, isPending, isSuccess, isError, error } = useListUserRoutines();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createPublicRoutine, listPublicRoutines, createUserRoutine, listUserRoutines } from '@dataconnect/generated';


// Operation CreatePublicRoutine:  For variables, look at type CreatePublicRoutineVars in ../index.d.ts
const { data } = await CreatePublicRoutine(dataConnect, createPublicRoutineVars);

// Operation ListPublicRoutines: 
const { data } = await ListPublicRoutines(dataConnect);

// Operation CreateUserRoutine:  For variables, look at type CreateUserRoutineVars in ../index.d.ts
const { data } = await CreateUserRoutine(dataConnect, createUserRoutineVars);

// Operation ListUserRoutines: 
const { data } = await ListUserRoutines(dataConnect);


```