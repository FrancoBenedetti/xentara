# Table structure as at 2026/04/26

## Table `boards`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `hub_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `archetype` | `text` |  Nullable |
| `config` | `jsonb` |  Nullable |
| `is_public` | `bool` |  Nullable |

## Table `consumer_profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `display_alias` | `text` |  Nullable |
| `avatar_hash` | `text` |  Nullable |
| `is_anonymous` | `bool` |  |
| `preferences` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `distribution_log`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `publication_id` | `uuid` |  |
| `hub_channel_id` | `uuid` |  Nullable |
| `platform` | `text` |  |
| `target_id` | `text` |  |
| `status` | `text` |  Nullable |
| `message_id` | `text` |  Nullable |
| `error_message` | `text` |  Nullable |
| `sent_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `hub_channels`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `hub_id` | `uuid` |  |
| `platform` | `text` |  |
| `channel_id` | `text` |  |
| `channel_name` | `text` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `added_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `hub_engagement_config`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `hub_id` | `uuid` |  Unique |
| `reactions_enabled` | `_text` |  |
| `comments_enabled` | `bool` |  |
| `updated_at` | `timestamptz` |  |

## Table `hub_invitations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `hub_id` | `uuid` |  |
| `email` | `text` |  |
| `role` | `hub_role` |  |
| `invited_by` | `uuid` |  |
| `created_at` | `timestamptz` |  |
| `expires_at` | `timestamptz` |  |

## Table `hub_memberships`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `hub_id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `role` | `hub_role` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `hub_promotion_suppressions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `promotion_id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `suppressed_at` | `timestamptz` |  |

## Table `hub_promotions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `hub_id` | `uuid` |  |
| `created_by` | `uuid` |  |
| `type` | `text` |  |
| `title` | `text` |  |
| `body` | `text` |  Nullable |
| `links` | `jsonb` |  Nullable |
| `campaign_code` | `text` |  Nullable |
| `start_date` | `timestamptz` |  Nullable |
| `end_date` | `timestamptz` |  Nullable |
| `frequency_hours` | `int4` |  |
| `is_active` | `bool` |  |
| `allow_suppress` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `hub_subscriptions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `consumer_id` | `uuid` |  |
| `hub_id` | `uuid` |  |
| `notification_preference` | `text` |  |
| `subscribed_at` | `timestamptz` |  |

## Table `hub_tag_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tag_id` | `uuid` |  |
| `language` | `text` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `hub_tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `hub_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `is_confirmed` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `language` | `text` |  |

## Table `hubs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `owner_id` | `uuid` |  Nullable |
| `settings` | `jsonb` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `brand_color` | `text` |  Nullable |
| `logo_url` | `text` |  Nullable |
| `strictness` | `text` |  Nullable |
| `content_language` | `text` |  |
| `curator_take_label` | `text` |  Nullable |

## Table `link_tokens`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `messenger_identity_id` | `uuid` |  Nullable |
| `token` | `text` |  Unique |
| `expires_at` | `timestamptz` |  |
| `claimed_by` | `uuid` |  Nullable |
| `claimed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `messenger_identities`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `platform` | `text` |  |
| `platform_user_id` | `text` |  |
| `platform_username` | `text` |  Nullable |
| `consumer_id` | `uuid` |  Nullable |
| `is_verified` | `bool` |  |
| `linked_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `monitored_sources`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `hub_id` | `uuid` |  |
| `name` | `text` |  |
| `type` | `source_type` |  Nullable |
| `url` | `text` |  |
| `config` | `jsonb` |  Nullable |
| `last_fetched_at` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  Nullable |

## Table `platform_promotions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `type` | `text` |  |
| `title` | `text` |  |
| `body` | `text` |  Nullable |
| `links` | `jsonb` |  Nullable |
| `frequency_hours` | `int4` |  |
| `is_active` | `bool` |  |
| `guests_only` | `bool` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `text` |  Unique |
| `display_name` | `text` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `is_staff` | `bool` |  |

## Table `publication_engagement`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `publication_id` | `uuid` |  |
| `hub_id` | `uuid` |  |
| `consumer_id` | `uuid` |  Nullable |
| `messenger_identity_id` | `uuid` |  Nullable |
| `platform` | `text` |  |
| `type` | `text` |  |
| `value` | `text` |  |
| `sentiment_score` | `float8` |  Nullable |
| `metadata` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `publication_hub_tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `publication_id` | `uuid` |  |
| `tag_id` | `uuid` |  |
| `is_suppressed` | `bool` |  |
| `id` | `uuid` | Primary |

## Table `publications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `hub_id` | `uuid` |  |
| `source_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `raw_content` | `text` |  Nullable |
| `summary` | `text` |  Nullable |
| `byline` | `text` |  Nullable |
| `sentiment_score` | `float8` |  Nullable |
| `tags` | `_text` |  Nullable |
| `intelligence_metadata` | `jsonb` |  Nullable |
| `status` | `publication_status` |  Nullable |
| `source_url` | `text` |  Nullable |
| `published_at` | `timestamptz` |  Nullable |
| `curator_commentary` | `text` |  Nullable |
| `is_published` | `bool` |  Nullable |
| `curator_published_at` | `timestamptz` |  Nullable |
| `error_message` | `text` |  Nullable |
| `synopsis` | `text` |  Nullable |
| `purge_reason` | `text` |  Nullable |

## Table `route_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `requested_by` | `uuid` |  |
| `requested_by_hub_id` | `uuid` |  Nullable |
| `target_url` | `text` |  |
| `instructions` | `text` |  Nullable |
| `access_notes` | `text` |  Nullable |
| `status` | `text` |  |
| `rsshub_namespace` | `text` |  Nullable |
| `rsshub_route_path` | `text` |  Nullable |
| `rsshub_example_url` | `text` |  Nullable |
| `resolution_notes` | `text` |  Nullable |
| `resolved_at` | `timestamptz` |  Nullable |
| `resolved_by` | `text` |  Nullable |

## Table `source_filter_rules`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `source_id` | `uuid` |  |
| `rule_type` | `text` |  |
| `match_mode` | `text` |  |
| `value` | `text` |  |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |

