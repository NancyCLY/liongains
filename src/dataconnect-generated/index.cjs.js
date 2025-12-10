const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'liongains',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createPublicRoutineRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePublicRoutine', inputVars);
}
createPublicRoutineRef.operationName = 'CreatePublicRoutine';
exports.createPublicRoutineRef = createPublicRoutineRef;

exports.createPublicRoutine = function createPublicRoutine(dcOrVars, vars) {
  return executeMutation(createPublicRoutineRef(dcOrVars, vars));
};

const listPublicRoutinesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPublicRoutines');
}
listPublicRoutinesRef.operationName = 'ListPublicRoutines';
exports.listPublicRoutinesRef = listPublicRoutinesRef;

exports.listPublicRoutines = function listPublicRoutines(dc) {
  return executeQuery(listPublicRoutinesRef(dc));
};

const createUserRoutineRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUserRoutine', inputVars);
}
createUserRoutineRef.operationName = 'CreateUserRoutine';
exports.createUserRoutineRef = createUserRoutineRef;

exports.createUserRoutine = function createUserRoutine(dcOrVars, vars) {
  return executeMutation(createUserRoutineRef(dcOrVars, vars));
};

const listUserRoutinesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUserRoutines');
}
listUserRoutinesRef.operationName = 'ListUserRoutines';
exports.listUserRoutinesRef = listUserRoutinesRef;

exports.listUserRoutines = function listUserRoutines(dc) {
  return executeQuery(listUserRoutinesRef(dc));
};
