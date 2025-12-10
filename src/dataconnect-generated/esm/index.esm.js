import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'liongains',
  location: 'us-east4'
};

export const createPublicRoutineRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePublicRoutine', inputVars);
}
createPublicRoutineRef.operationName = 'CreatePublicRoutine';

export function createPublicRoutine(dcOrVars, vars) {
  return executeMutation(createPublicRoutineRef(dcOrVars, vars));
}

export const listPublicRoutinesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPublicRoutines');
}
listPublicRoutinesRef.operationName = 'ListPublicRoutines';

export function listPublicRoutines(dc) {
  return executeQuery(listPublicRoutinesRef(dc));
}

export const createUserRoutineRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUserRoutine', inputVars);
}
createUserRoutineRef.operationName = 'CreateUserRoutine';

export function createUserRoutine(dcOrVars, vars) {
  return executeMutation(createUserRoutineRef(dcOrVars, vars));
}

export const listUserRoutinesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUserRoutines');
}
listUserRoutinesRef.operationName = 'ListUserRoutines';

export function listUserRoutines(dc) {
  return executeQuery(listUserRoutinesRef(dc));
}

