/**
 * Whitelist of stored procedure/function names callable via
 * `DatabaseService.callFunction`. Extended per-milestone as new `.sql`
 * files are added under `src/database/procedures/<domain>/` — never widen
 * `callFunction`'s `name` param to a bare `string`.
 */
export type ProcedureName =
  | 'fn_list_accounts'
  | 'sp_approve_account'
  | 'sp_reject_account'
  | 'sp_suspend_account';
