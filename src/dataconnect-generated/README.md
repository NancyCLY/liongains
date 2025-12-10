# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPublicRoutines*](#listpublicroutines)
  - [*ListUserRoutines*](#listuserroutines)
- [**Mutations**](#mutations)
  - [*CreatePublicRoutine*](#createpublicroutine)
  - [*CreateUserRoutine*](#createuserroutine)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPublicRoutines
You can execute the `ListPublicRoutines` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPublicRoutines(): QueryPromise<ListPublicRoutinesData, undefined>;

interface ListPublicRoutinesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPublicRoutinesData, undefined>;
}
export const listPublicRoutinesRef: ListPublicRoutinesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPublicRoutines(dc: DataConnect): QueryPromise<ListPublicRoutinesData, undefined>;

interface ListPublicRoutinesRef {
  ...
  (dc: DataConnect): QueryRef<ListPublicRoutinesData, undefined>;
}
export const listPublicRoutinesRef: ListPublicRoutinesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPublicRoutinesRef:
```typescript
const name = listPublicRoutinesRef.operationName;
console.log(name);
```

### Variables
The `ListPublicRoutines` query has no variables.
### Return Type
Recall that executing the `ListPublicRoutines` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPublicRoutinesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPublicRoutinesData {
  routines: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    durationEstimateMinutes?: number | null;
  } & Routine_Key)[];
}
```
### Using `ListPublicRoutines`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPublicRoutines } from '@dataconnect/generated';


// Call the `listPublicRoutines()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPublicRoutines();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPublicRoutines(dataConnect);

console.log(data.routines);

// Or, you can use the `Promise` API.
listPublicRoutines().then((response) => {
  const data = response.data;
  console.log(data.routines);
});
```

### Using `ListPublicRoutines`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPublicRoutinesRef } from '@dataconnect/generated';


// Call the `listPublicRoutinesRef()` function to get a reference to the query.
const ref = listPublicRoutinesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPublicRoutinesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.routines);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.routines);
});
```

## ListUserRoutines
You can execute the `ListUserRoutines` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUserRoutines(): QueryPromise<ListUserRoutinesData, undefined>;

interface ListUserRoutinesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserRoutinesData, undefined>;
}
export const listUserRoutinesRef: ListUserRoutinesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUserRoutines(dc: DataConnect): QueryPromise<ListUserRoutinesData, undefined>;

interface ListUserRoutinesRef {
  ...
  (dc: DataConnect): QueryRef<ListUserRoutinesData, undefined>;
}
export const listUserRoutinesRef: ListUserRoutinesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUserRoutinesRef:
```typescript
const name = listUserRoutinesRef.operationName;
console.log(name);
```

### Variables
The `ListUserRoutines` query has no variables.
### Return Type
Recall that executing the `ListUserRoutines` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUserRoutinesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUserRoutinesData {
  routines: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    durationEstimateMinutes?: number | null;
    isPublic: boolean;
  } & Routine_Key)[];
}
```
### Using `ListUserRoutines`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUserRoutines } from '@dataconnect/generated';


// Call the `listUserRoutines()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUserRoutines();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUserRoutines(dataConnect);

console.log(data.routines);

// Or, you can use the `Promise` API.
listUserRoutines().then((response) => {
  const data = response.data;
  console.log(data.routines);
});
```

### Using `ListUserRoutines`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUserRoutinesRef } from '@dataconnect/generated';


// Call the `listUserRoutinesRef()` function to get a reference to the query.
const ref = listUserRoutinesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUserRoutinesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.routines);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.routines);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreatePublicRoutine
You can execute the `CreatePublicRoutine` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPublicRoutine(vars: CreatePublicRoutineVariables): MutationPromise<CreatePublicRoutineData, CreatePublicRoutineVariables>;

interface CreatePublicRoutineRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePublicRoutineVariables): MutationRef<CreatePublicRoutineData, CreatePublicRoutineVariables>;
}
export const createPublicRoutineRef: CreatePublicRoutineRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPublicRoutine(dc: DataConnect, vars: CreatePublicRoutineVariables): MutationPromise<CreatePublicRoutineData, CreatePublicRoutineVariables>;

interface CreatePublicRoutineRef {
  ...
  (dc: DataConnect, vars: CreatePublicRoutineVariables): MutationRef<CreatePublicRoutineData, CreatePublicRoutineVariables>;
}
export const createPublicRoutineRef: CreatePublicRoutineRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPublicRoutineRef:
```typescript
const name = createPublicRoutineRef.operationName;
console.log(name);
```

### Variables
The `CreatePublicRoutine` mutation requires an argument of type `CreatePublicRoutineVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePublicRoutineVariables {
  name: string;
  description?: string | null;
  durationEstimateMinutes?: number | null;
  isPublic: boolean;
}
```
### Return Type
Recall that executing the `CreatePublicRoutine` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePublicRoutineData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePublicRoutineData {
  routine_insert: Routine_Key;
}
```
### Using `CreatePublicRoutine`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPublicRoutine, CreatePublicRoutineVariables } from '@dataconnect/generated';

// The `CreatePublicRoutine` mutation requires an argument of type `CreatePublicRoutineVariables`:
const createPublicRoutineVars: CreatePublicRoutineVariables = {
  name: ..., 
  description: ..., // optional
  durationEstimateMinutes: ..., // optional
  isPublic: ..., 
};

// Call the `createPublicRoutine()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPublicRoutine(createPublicRoutineVars);
// Variables can be defined inline as well.
const { data } = await createPublicRoutine({ name: ..., description: ..., durationEstimateMinutes: ..., isPublic: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPublicRoutine(dataConnect, createPublicRoutineVars);

console.log(data.routine_insert);

// Or, you can use the `Promise` API.
createPublicRoutine(createPublicRoutineVars).then((response) => {
  const data = response.data;
  console.log(data.routine_insert);
});
```

### Using `CreatePublicRoutine`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPublicRoutineRef, CreatePublicRoutineVariables } from '@dataconnect/generated';

// The `CreatePublicRoutine` mutation requires an argument of type `CreatePublicRoutineVariables`:
const createPublicRoutineVars: CreatePublicRoutineVariables = {
  name: ..., 
  description: ..., // optional
  durationEstimateMinutes: ..., // optional
  isPublic: ..., 
};

// Call the `createPublicRoutineRef()` function to get a reference to the mutation.
const ref = createPublicRoutineRef(createPublicRoutineVars);
// Variables can be defined inline as well.
const ref = createPublicRoutineRef({ name: ..., description: ..., durationEstimateMinutes: ..., isPublic: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPublicRoutineRef(dataConnect, createPublicRoutineVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.routine_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.routine_insert);
});
```

## CreateUserRoutine
You can execute the `CreateUserRoutine` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUserRoutine(vars: CreateUserRoutineVariables): MutationPromise<CreateUserRoutineData, CreateUserRoutineVariables>;

interface CreateUserRoutineRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserRoutineVariables): MutationRef<CreateUserRoutineData, CreateUserRoutineVariables>;
}
export const createUserRoutineRef: CreateUserRoutineRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUserRoutine(dc: DataConnect, vars: CreateUserRoutineVariables): MutationPromise<CreateUserRoutineData, CreateUserRoutineVariables>;

interface CreateUserRoutineRef {
  ...
  (dc: DataConnect, vars: CreateUserRoutineVariables): MutationRef<CreateUserRoutineData, CreateUserRoutineVariables>;
}
export const createUserRoutineRef: CreateUserRoutineRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRoutineRef:
```typescript
const name = createUserRoutineRef.operationName;
console.log(name);
```

### Variables
The `CreateUserRoutine` mutation requires an argument of type `CreateUserRoutineVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserRoutineVariables {
  name: string;
  description?: string | null;
  durationEstimateMinutes?: number | null;
  isPublic: boolean;
}
```
### Return Type
Recall that executing the `CreateUserRoutine` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserRoutineData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserRoutineData {
  routine_insert: Routine_Key;
}
```
### Using `CreateUserRoutine`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUserRoutine, CreateUserRoutineVariables } from '@dataconnect/generated';

// The `CreateUserRoutine` mutation requires an argument of type `CreateUserRoutineVariables`:
const createUserRoutineVars: CreateUserRoutineVariables = {
  name: ..., 
  description: ..., // optional
  durationEstimateMinutes: ..., // optional
  isPublic: ..., 
};

// Call the `createUserRoutine()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUserRoutine(createUserRoutineVars);
// Variables can be defined inline as well.
const { data } = await createUserRoutine({ name: ..., description: ..., durationEstimateMinutes: ..., isPublic: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUserRoutine(dataConnect, createUserRoutineVars);

console.log(data.routine_insert);

// Or, you can use the `Promise` API.
createUserRoutine(createUserRoutineVars).then((response) => {
  const data = response.data;
  console.log(data.routine_insert);
});
```

### Using `CreateUserRoutine`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRoutineRef, CreateUserRoutineVariables } from '@dataconnect/generated';

// The `CreateUserRoutine` mutation requires an argument of type `CreateUserRoutineVariables`:
const createUserRoutineVars: CreateUserRoutineVariables = {
  name: ..., 
  description: ..., // optional
  durationEstimateMinutes: ..., // optional
  isPublic: ..., 
};

// Call the `createUserRoutineRef()` function to get a reference to the mutation.
const ref = createUserRoutineRef(createUserRoutineVars);
// Variables can be defined inline as well.
const ref = createUserRoutineRef({ name: ..., description: ..., durationEstimateMinutes: ..., isPublic: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRoutineRef(dataConnect, createUserRoutineVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.routine_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.routine_insert);
});
```

