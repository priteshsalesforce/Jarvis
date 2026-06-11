import { meetingConflictFixture } from '@/slackbot-templates/fixtures/meetingConflict.fixture'

/**
 * Per-template fixture data for previews, snapshot tests, and the LLM eval.
 *
 * Templates whose `variables` array is empty (e.g. all bk_* templates imported
 * from Block Kit Builder URLs) don't need fixture data; `renderSlackTemplate`
 * just substitutes `{}` and the static blocksTemplate renders as-is. They are
 * still listed here for completeness so QA can iterate every known template.
 */
export const BLOCK_KIT_TEMPLATE_FIXTURES: Record<string, Record<string, unknown>> = {
  meeting_conflict: meetingConflictFixture,
  bk_device_request_approval: {},
  bk_time_off_approval: {},
  bk_taskbot_onboarding: {},
  bk_calendar_connect_welcome: {},
  bk_lunch_poll: {},
  bk_hotel_search_results: {},
  bk_knowledge_search_results: {},
  bk_company_newsletter: {},
}

export function getFixtureForBlockKitTemplate(
  templateId: string
): Record<string, unknown> {
  return BLOCK_KIT_TEMPLATE_FIXTURES[templateId] ?? {}
}

export { meetingConflictFixture }
