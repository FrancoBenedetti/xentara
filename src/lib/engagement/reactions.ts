export type ReactionKey =
  | 'insight'
  | 'helpful'
  | 'irrelevant'
  | 'trending'
  | 'share'
  | 'question';

export interface ReactionDefinition {
  key: ReactionKey;
  emoji: string;
  label: string;
  callbackLabel: string; // Shown in Telegram answerCallbackQuery toast
}

export const BASE_REACTION_SET: Record<ReactionKey, ReactionDefinition> = {
  insight:    { key: 'insight',    emoji: '🧠', label: 'Insight',      callbackLabel: '🧠 Marked as Insight' },
  helpful:    { key: 'helpful',    emoji: '👍', label: 'Helpful',      callbackLabel: '👍 Marked as Helpful' },
  irrelevant: { key: 'irrelevant', emoji: '👎', label: 'Not for me',   callbackLabel: '👎 Noted' },
  trending:   { key: 'trending',   emoji: '🔥', label: 'Trending',     callbackLabel: '🔥 Marked as Trending' },
  share:      { key: 'share',      emoji: '🚀', label: 'Share-worthy', callbackLabel: '🚀 Worth Sharing' },
  question:   { key: 'question',   emoji: '❓', label: 'Need context', callbackLabel: '❓ Context Requested' },
};

export const DEFAULT_REACTIONS: ReactionKey[] = ['insight', 'helpful', 'irrelevant'];

/** Build reaction buttons for a Telegram inline keyboard row. */
export function buildReactionButtons(
  publicationId: string,
  enabledReactions: string[]
): Array<{ text: string; callback_data: string }> {
  return enabledReactions
    .filter((key): key is ReactionKey => key in BASE_REACTION_SET)
    .map(key => {
        const typedKey = key as ReactionKey;
        return {
            text: `${BASE_REACTION_SET[typedKey].emoji} ${BASE_REACTION_SET[typedKey].label}`,
            callback_data: `react_${publicationId}_${key}`
        };
    });
}
