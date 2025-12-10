import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreatePublicRoutineData {
  routine_insert: Routine_Key;
}

export interface CreatePublicRoutineVariables {
  name: string;
  description?: string | null;
  durationEstimateMinutes?: number | null;
  isPublic: boolean;
}

export interface CreateUserRoutineData {
  routine_insert: Routine_Key;
}

export interface CreateUserRoutineVariables {
  name: string;
  description?: string | null;
  durationEstimateMinutes?: number | null;
  isPublic: boolean;
}

export interface Exercise_Key {
  id: UUIDString;
  __typename?: 'Exercise_Key';
}

export interface ListPublicRoutinesData {
  routines: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    durationEstimateMinutes?: number | null;
  } & Routine_Key)[];
}

export interface ListUserRoutinesData {
  routines: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    durationEstimateMinutes?: number | null;
    isPublic: boolean;
  } & Routine_Key)[];
}

export interface RoutineExercise_Key {
  id: UUIDString;
  __typename?: 'RoutineExercise_Key';
}

export interface Routine_Key {
  id: UUIDString;
  __typename?: 'Routine_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface WorkoutExercise_Key {
  id: UUIDString;
  __typename?: 'WorkoutExercise_Key';
}

export interface Workout_Key {
  id: UUIDString;
  __typename?: 'Workout_Key';
}

interface CreatePublicRoutineRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePublicRoutineVariables): MutationRef<CreatePublicRoutineData, CreatePublicRoutineVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePublicRoutineVariables): MutationRef<CreatePublicRoutineData, CreatePublicRoutineVariables>;
  operationName: string;
}
export const createPublicRoutineRef: CreatePublicRoutineRef;

export function createPublicRoutine(vars: CreatePublicRoutineVariables): MutationPromise<CreatePublicRoutineData, CreatePublicRoutineVariables>;
export function createPublicRoutine(dc: DataConnect, vars: CreatePublicRoutineVariables): MutationPromise<CreatePublicRoutineData, CreatePublicRoutineVariables>;

interface ListPublicRoutinesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPublicRoutinesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPublicRoutinesData, undefined>;
  operationName: string;
}
export const listPublicRoutinesRef: ListPublicRoutinesRef;

export function listPublicRoutines(): QueryPromise<ListPublicRoutinesData, undefined>;
export function listPublicRoutines(dc: DataConnect): QueryPromise<ListPublicRoutinesData, undefined>;

interface CreateUserRoutineRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserRoutineVariables): MutationRef<CreateUserRoutineData, CreateUserRoutineVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserRoutineVariables): MutationRef<CreateUserRoutineData, CreateUserRoutineVariables>;
  operationName: string;
}
export const createUserRoutineRef: CreateUserRoutineRef;

export function createUserRoutine(vars: CreateUserRoutineVariables): MutationPromise<CreateUserRoutineData, CreateUserRoutineVariables>;
export function createUserRoutine(dc: DataConnect, vars: CreateUserRoutineVariables): MutationPromise<CreateUserRoutineData, CreateUserRoutineVariables>;

interface ListUserRoutinesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserRoutinesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUserRoutinesData, undefined>;
  operationName: string;
}
export const listUserRoutinesRef: ListUserRoutinesRef;

export function listUserRoutines(): QueryPromise<ListUserRoutinesData, undefined>;
export function listUserRoutines(dc: DataConnect): QueryPromise<ListUserRoutinesData, undefined>;

