const crypto=require('crypto');

const ENCRYPTION_ENABLED = process.env.EONS_ENCRYPTION_ENABLED === 'true';

function gate(){
    return {
      enabled:false,
      status:'BLOCKED',
      reason:'EONS_ENCRYPTION_ENABLED is not true. Encryption service is scaffold only.'
    };
  }
  return {enabled:true,status:'READY_FOR_REVIEW'};
}

function mockFingerprint(input){
  const text=String(input||'');
  return crypto.createHash('sha256').update(text).digest('hex');
}

function encryptDisabled(){
  return {
    ok:false,
    status:'BLOCKED',
    message:'Real encryption is disabled in staging. Do not upload sensitive records yet.'
  };
}

module.exports={gate,mockFingerprint,encryptDisabled};
