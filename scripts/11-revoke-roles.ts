import sdk from './1-initialize-sdk';

const tokenModule = sdk.getTokenModule(
  process.env.NEXT_PUBLIC_TOKEN_MODULE_ADDRESS,
);

(async () => {
  try {
      console.log('Roles that exist right now:', await tokenModule.getAllRoleMembers());

      await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
      console.log('Roles after revoking oursevles', await tokenModule.getAllRoleMembers());
      console.log('Successfully revoked roles.');
  } catch (err) {
    console.error('Failed to revoke ourselves from the DAO treasury', err);
  }
})();
