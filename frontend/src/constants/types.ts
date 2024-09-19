export interface IUser {
  pi_uid: string;
  pi_username: string;
  user_name: string;
}

export interface IUserSettings {
  user_settings_id?: string | null;
  user_name?: string;
  email?: string;
  phone_number?: string;
  image?: string; 
  findme?: string;
  trust_meter_rating: number;
  search_map_center?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface ISeller {
  seller_id: string;
  name: string;
  description: string;
  seller_type: string;
  image: string;
  address: string;
  average_rating: {
    $numberDecimal: string;
  };
  coordinates: [number, number];
  order_online_enabled_pref: boolean;
};

export interface IReviewFeedback {
  _id: string;
  review_receiver_id: string;
  review_giver_id: string;
  reply_to_review_id: string | null;
  rating: number;
  comment: string;
  image: string;
  review_date: string;
}

// Select specific fields from IUserSettings
export type PartialUserSettings = Pick<IUserSettings, 'user_name' | 'email' | 'phone_number' | 'findme' | 'trust_meter_rating'>;

// Combined interface representing a seller with selected user settings
export interface ISellerWithSettings extends ISeller, PartialUserSettings {}

// Pi SDK type definitions
// Based on SDK reference at https://github.com/pi-apps/pi-platform-docs/blob/master/SDK_reference.md

interface PaymentDTO {
  amount: number,
  user_uid: string,
  created_at: string,
  identifier: string,
  metadata: Object,
  memo: string,
  status: {
    developer_approved: boolean,
    transaction_verified: boolean,
    developer_completed: boolean,
    cancelled: boolean,
    user_cancelled: boolean,
  },
  to_address: string,
  transaction: null | {
    txid: string,
    verified: boolean,
    _link: string,
  },
};

type PiScope =  "payments" | "username" | "roles" | "wallet_address";

// TODO: Add more adequate typing if payments are introduced
export type OnIncompletePaymentFoundType = (payment: PaymentDTO) => void ;

export interface AuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
};

type AuthenticateType = (
  scopes: PiScope[],
  onIncompletePaymentFound: OnIncompletePaymentFoundType
) => Promise<AuthResult>;

interface InitParams {
  version: string,
  sandbox?: boolean
}

interface PiType {
  authenticate: AuthenticateType;
  init: (config: InitParams) => void;
  initialized: boolean;
};

// End Pi SDK type definitions

declare global {
  const Pi: PiType;
}