import { CreatePublicRoutineData, CreatePublicRoutineVariables, ListPublicRoutinesData, CreateUserRoutineData, CreateUserRoutineVariables, ListUserRoutinesData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreatePublicRoutine(options?: useDataConnectMutationOptions<CreatePublicRoutineData, FirebaseError, CreatePublicRoutineVariables>): UseDataConnectMutationResult<CreatePublicRoutineData, CreatePublicRoutineVariables>;
export function useCreatePublicRoutine(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePublicRoutineData, FirebaseError, CreatePublicRoutineVariables>): UseDataConnectMutationResult<CreatePublicRoutineData, CreatePublicRoutineVariables>;

export function useListPublicRoutines(options?: useDataConnectQueryOptions<ListPublicRoutinesData>): UseDataConnectQueryResult<ListPublicRoutinesData, undefined>;
export function useListPublicRoutines(dc: DataConnect, options?: useDataConnectQueryOptions<ListPublicRoutinesData>): UseDataConnectQueryResult<ListPublicRoutinesData, undefined>;

export function useCreateUserRoutine(options?: useDataConnectMutationOptions<CreateUserRoutineData, FirebaseError, CreateUserRoutineVariables>): UseDataConnectMutationResult<CreateUserRoutineData, CreateUserRoutineVariables>;
export function useCreateUserRoutine(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserRoutineData, FirebaseError, CreateUserRoutineVariables>): UseDataConnectMutationResult<CreateUserRoutineData, CreateUserRoutineVariables>;

export function useListUserRoutines(options?: useDataConnectQueryOptions<ListUserRoutinesData>): UseDataConnectQueryResult<ListUserRoutinesData, undefined>;
export function useListUserRoutines(dc: DataConnect, options?: useDataConnectQueryOptions<ListUserRoutinesData>): UseDataConnectQueryResult<ListUserRoutinesData, undefined>;
