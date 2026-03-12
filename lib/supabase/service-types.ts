import type { Database } from './types';

/**
 * Extends the generated Database type with functions that have EXECUTE
 * revoked from public/anon/authenticated roles. These are only callable
 * via the service-role client.
 */
export type ServiceDatabase = Database & {
  public: Omit<Database['public'], 'Functions'> & {
    Functions: Database['public']['Functions'] & {
      purchase_item: {
        Args: {
          p_user_id: string;
          p_item_id: string;
          p_request_id: string;
        };
        Returns: number;
      };
      credit_completion_sparks: {
        Args: {
          p_user_id: string;
          p_session_id: string;
          p_amount: number;
        };
        Returns: number;
      };
    };
  };
};
