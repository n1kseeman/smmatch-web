export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          display_name: string;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["app_role"];
          status: Database["public"]["Enums"]["user_status"];
          phone: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          status?: Database["public"]["Enums"]["user_status"];
          phone?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      freelancer_profiles: EntityTable<
        FreelancerProfileRow,
        "user_id" | "slug"
      >;
      services: EntityTable<
        ServiceRow,
        | "freelancer_id"
        | "slug"
        | "title"
        | "description"
        | "category"
        | "price_minor"
      >;
      orders: EntityTable<
        OrderRow,
        "customer_id" | "title" | "description" | "category"
      >;
      proposals: EntityTable<
        ProposalRow,
        | "order_id"
        | "freelancer_id"
        | "cover_letter"
        | "amount_minor"
        | "delivery_days"
      >;
      deals: EntityTable<
        DealRow,
        | "order_id"
        | "customer_id"
        | "freelancer_id"
        | "amount_minor"
      >;
      conversations: EntityTable<
        ConversationRow,
        "created_by"
      >;
      conversation_participants: EntityTable<
        ConversationParticipantRow,
        "conversation_id" | "user_id"
      >;
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string | null;
          attachment_url: string | null;
          kind: Database["public"]["Enums"]["message_kind"];
          reply_to_id: string | null;
          edited_at: string | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body?: string | null;
          attachment_url?: string | null;
          kind?: Database["public"]["Enums"]["message_kind"];
          reply_to_id?: string | null;
          edited_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["messages"]["Insert"]
        >;
        Relationships: [];
      };
      reviews: EntityTable<
        ReviewRow,
        "deal_id" | "reviewer_id" | "reviewee_id" | "rating"
      >;
      disputes: EntityTable<
        DisputeRow,
        "deal_id" | "opened_by" | "reason"
      >;
      transactions: EntityTable<
        TransactionRow,
        "type" | "provider" | "amount_minor"
      >;
      payment_webhook_events: EntityTable<
        PaymentWebhookEventRow,
        "provider" | "provider_event_id" | "payload"
      >;
      reports: EntityTable<
        ReportRow,
        "reporter_id" | "target_type" | "target_id" | "reason"
      >;
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["notifications"]["Insert"]
        >;
        Relationships: [];
      };
      device_tokens: EntityTable<
        DeviceTokenRow,
        "user_id" | "token" | "platform"
      >;
    };
    Views: Record<string, never>;
    Functions: {
      current_app_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Enums"]["app_role"] | null;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_conversation_member: {
        Args: { target_conversation_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "customer" | "freelancer" | "admin";
      user_status: "active" | "suspended" | "deleted";
      service_status: "draft" | "published" | "archived";
      order_status:
        | "draft"
        | "open"
        | "in_review"
        | "matched"
        | "in_progress"
        | "completed"
        | "cancelled";
      proposal_status: "pending" | "accepted" | "rejected" | "withdrawn";
      deal_status:
        | "pending_payment"
        | "funded"
        | "in_progress"
        | "submitted"
        | "completed"
        | "cancelled"
        | "disputed"
        | "refunded";
      dispute_status: "open" | "under_review" | "resolved" | "rejected";
      transaction_type:
        | "authorization"
        | "capture"
        | "charge"
        | "refund"
        | "payout"
        | "fee";
      transaction_status:
        | "pending"
        | "processing"
        | "succeeded"
        | "failed"
        | "cancelled";
      payment_provider: "mock" | "bepaid" | "webpay" | "manual";
      pricing_type: "fixed" | "hourly" | "starting_at";
      conversation_kind: "direct" | "deal" | "support";
      message_kind: "text" | "file" | "system";
      report_status: "open" | "reviewing" | "resolved" | "dismissed";
      report_target: "user" | "service" | "order" | "message" | "review";
    };
    CompositeTypes: Record<string, never>;
  };
};

type EntityTable<
  Row extends Record<string, unknown>,
  RequiredInsert extends keyof Row,
> = {
  Row: Row;
  Insert: Pick<Row, RequiredInsert> & Partial<Omit<Row, RequiredInsert>>;
  Update: Partial<Row>;
  Relationships: [];
};

type Timestamps = {
  created_at: string;
  updated_at: string;
};

type FreelancerProfileRow = Timestamps & {
  user_id: string;
  slug: string;
  headline: string;
  bio: string;
  skills: string[];
  languages: string[];
  country_code: string | null;
  timezone: string;
  experience_years: number;
  hourly_rate_minor: number | null;
  currency: string;
  is_available: boolean;
  is_published: boolean;
  verified_at: string | null;
  rating: number;
  reviews_count: number;
};

type ServiceRow = Timestamps & {
  id: string;
  freelancer_id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  pricing_type: Database["public"]["Enums"]["pricing_type"];
  price_minor: number;
  currency: string;
  delivery_days: number | null;
  status: Database["public"]["Enums"]["service_status"];
  published_at: string | null;
};

type OrderRow = Timestamps & {
  id: string;
  customer_id: string;
  assigned_freelancer_id: string | null;
  service_id: string | null;
  title: string;
  description: string;
  category: string;
  required_skills: string[];
  budget_min_minor: number | null;
  budget_max_minor: number | null;
  currency: string;
  deadline_at: string | null;
  status: Database["public"]["Enums"]["order_status"];
  published_at: string | null;
};

type ProposalRow = Timestamps & {
  id: string;
  order_id: string;
  freelancer_id: string;
  cover_letter: string;
  amount_minor: number;
  currency: string;
  delivery_days: number;
  status: Database["public"]["Enums"]["proposal_status"];
};

type DealRow = Timestamps & {
  id: string;
  order_id: string;
  proposal_id: string | null;
  customer_id: string;
  freelancer_id: string;
  amount_minor: number;
  platform_fee_minor: number;
  currency: string;
  status: Database["public"]["Enums"]["deal_status"];
  version: number;
  funded_at: string | null;
  started_at: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
};

type ConversationRow = Timestamps & {
  id: string;
  kind: Database["public"]["Enums"]["conversation_kind"];
  created_by: string;
  order_id: string | null;
  deal_id: string | null;
  subject: string | null;
  last_message_at: string | null;
};

type ConversationParticipantRow = {
  conversation_id: string;
  user_id: string;
  last_read_at: string | null;
  muted_until: string | null;
  joined_at: string;
  left_at: string | null;
};

type ReviewRow = Timestamps & {
  id: string;
  deal_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  body: string;
  is_public: boolean;
};

type DisputeRow = Timestamps & {
  id: string;
  deal_id: string;
  opened_by: string;
  assigned_admin_id: string | null;
  reason: string;
  evidence: Json;
  status: Database["public"]["Enums"]["dispute_status"];
  resolution: string | null;
  resolved_at: string | null;
};

type TransactionRow = Timestamps & {
  id: string;
  deal_id: string | null;
  user_id: string | null;
  type: Database["public"]["Enums"]["transaction_type"];
  status: Database["public"]["Enums"]["transaction_status"];
  provider: Database["public"]["Enums"]["payment_provider"];
  external_transaction_id: string | null;
  idempotency_key: string;
  amount_minor: number;
  currency: string;
  provider_fee_minor: number;
  failure_code: string | null;
  metadata: Json;
  processed_at: string | null;
};

type PaymentWebhookEventRow = {
  id: string;
  provider: Database["public"]["Enums"]["payment_provider"];
  provider_event_id: string;
  signature_valid: boolean;
  payload: Json;
  processing_error: string | null;
  processed_at: string | null;
  received_at: string;
};

type ReportRow = Timestamps & {
  id: string;
  reporter_id: string;
  target_type: Database["public"]["Enums"]["report_target"];
  target_id: string;
  reason: string;
  status: Database["public"]["Enums"]["report_status"];
  assigned_admin_id: string | null;
  resolution_note: string | null;
  resolved_at: string | null;
};

type DeviceTokenRow = {
  id: string;
  user_id: string;
  token: string;
  platform: "ios" | "android" | "web";
  last_used_at: string;
  created_at: string;
};
