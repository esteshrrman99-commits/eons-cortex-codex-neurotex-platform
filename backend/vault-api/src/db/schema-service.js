const schema = require('./schema.json');

function getSchema(){
  return schema;
}

function getMigrationGate(){
  return {
    database_enabled:false,
    migration_status:'DRAFT_ONLY',
    production_gate:'BLOCKED',
    required_before_enablement:[
      'choose database provider',
      'create private database',
      'configure secrets outside Git',
      'apply migrations',
      'backup plan',
      'access controls',
      'audit logging',
      'security review'
    ]
  };
}

module.exports={getSchema,getMigrationGate};
