import type { ReactNode } from 'react'
import type { FC } from 'react'
import {
  AddRegular,
  AlertRegular,
  AppsRegular,
  BookContactsRegular,
  CalendarRegular,
  CalendarFilled,
  CallRegular,
  ChatRegular,
  ChatFilled,
  ChevronDownRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  ComposeRegular,
  CopilotBrand,
  FilterRegular,
  MoreHorizontalRegular,
  OpenRegular,
  PeopleTeamRegular,
  PeopleTeamFilled,
  PersonAddRegular,
  SearchRegular,
  ShieldCheckmarkRegular,
  SparkleCircleRegular,
  VideoCameraSmallRegular,
  VideoRegular,
  WindowNewRegular,
  type TeamsIconProps,
} from '@/components/icons/teams'
import { asset } from '@/utils/asset'

type RailEntry = 'activity' | 'chat' | 'communities' | 'calendar' | 'calls' | 'onedrive' | 'copilot' | 'apps'

interface ChatSidebarEntry {
  id: string
  name: string
  avatarUrl?: string
  initials?: string
  preview?: string
  time?: string
  unread?: boolean
  selected?: boolean
  pinned?: boolean
  /** When true, show the green status dot. Defaults true for user personas. */
  showStatus?: boolean
}

interface TeamSidebarChannel {
  id: string
  name: string
  selected?: boolean
  unread?: boolean
}

interface TeamSidebarTeam {
  id: string
  name: string
  initials: string
  channels: TeamSidebarChannel[]
  pinned?: boolean
}

export interface TeamsShellProps {
  /**
   * Optional tenant / org name — currently unused in the title bar (the latest
   * Teams desktop does not show it there), but retained for future surfaces.
   */
  tenantName?: string
  /** The active app rail entry. Determines which sidebar list renders. */
  railActive: RailEntry
  /** Chat list shown in the Chat sidebar (rendered when railActive === 'chat'). */
  chats?: ChatSidebarEntry[]
  /**
   * Teams + channels tree. Rendered as a flat "Teams and channels" section
   * inside the Chat sidebar, and also as the Pinned / Your teams tree on the
   * dedicated Communities surface.
   */
  teams?: TeamSidebarTeam[]
  /** Avatar URL shown in the top-right (current user). */
  meAvatarUrl?: string
  /** Initials fallback if no avatar. */
  meInitials?: string
  /** Optional: chat list header label (defaults to "Chat" or "Communities"). */
  sidebarTitle?: string
  /** Conversation header content (rendered above the chat). */
  conversationHeader?: ReactNode
  /** Main canvas content (chat view / app tab). */
  children: ReactNode
  /**
   * When the active demo conversation is with the pinned Copilot row, set
   * `'copilot'` so that the row renders with the white-card selected state.
   * For non-Copilot agents the engine should instead surface the agent as a
   * Favourites chat entry to avoid duplicating Copilot.
   */
  selectedPinned?: 'copilot'
}

export function TeamsShell({
  railActive,
  chats = [],
  teams = [],
  meAvatarUrl,
  meInitials = 'ME',
  sidebarTitle,
  conversationHeader,
  children,
  selectedPinned,
}: TeamsShellProps) {
  const computedTitle =
    sidebarTitle ?? (railActive === 'communities' ? 'Communities' : railActive === 'chat' ? 'Chat' : 'Activity')

  // The new Teams desktop puts a single pinned "Copilot" row at the top of the
  // Chat sidebar, followed by Quick views, Favourites, Chats, and a flattened
  // "Teams and channels" tree. The active demo persona is just whichever chat
  // row carries `selected: true`. The Communities surface keeps the older
  // Pinned / Your teams subdivision.
  const favorites = chats.filter((c) => c.pinned)
  const recentChats = chats.filter((c) => !c.pinned)
  const pinnedTeams = teams.filter((t) => t.pinned)
  const yourTeams = teams.filter((t) => !t.pinned)

  return (
    <div
      className="teams-chrome flex flex-col flex-1 min-h-0 min-w-0 w-full overflow-hidden rounded-[12px]"
      style={{ position: 'relative' }}
    >
      <TitleBar meAvatarUrl={meAvatarUrl} meInitials={meInitials} />

      <div className="teams-body">
        <AppRail active={railActive} />

        <aside className="teams-sidebar" aria-label="Secondary navigation">
          <div className="teams-sidebar__header">
            <span className="teams-sidebar__title">{computedTitle}</span>
            <div className="teams-sidebar__header-actions">
              <button className="teams-sidebar__icon-btn" type="button" tabIndex={-1} aria-label="Filter">
                <FilterRegular size={20} />
              </button>
              {railActive === 'chat' && (
                <button className="teams-sidebar__icon-btn" type="button" tabIndex={-1} aria-label="Video">
                  <VideoRegular size={20} />
                </button>
              )}
              <button
                className="teams-sidebar__icon-btn"
                type="button"
                tabIndex={-1}
                aria-label={railActive === 'chat' ? 'New chat' : 'Add community'}
              >
                <ComposeRegular size={20} />
              </button>
            </div>
          </div>

          {/* Filter pills (Unread / Channels / Chats) — visual-only, none
              shown active because the list below is unfiltered. */}
          {railActive === 'chat' && <FilterPills />}

          <div className="teams-sidebar__scroll">
            {railActive === 'chat' && (
              <>
                {/* Permanent pinned Copilot row in the new Teams desktop */}
                <div className="teams-sidebar__section teams-sidebar__section--pinned" role="list">
                  <PinnedRow
                    icon={
                      <img
                        src={asset('/assets/copilot-line-icon.svg')}
                        alt=""
                        width={20}
                        height={20}
                        aria-hidden
                      />
                    }
                    label="Copilot"
                    selected={selectedPinned === 'copilot'}
                  />
                </div>

                {/* Quick views: Discover + Drafts. Decorative only — mirrors
                    the new Teams desktop entries that sit between the pinned
                    Copilot row and the Favourites list. */}
                <CollapsibleSection label="Quick views">
                  <PinnedRow
                    icon={
                      <img
                        src={asset('/assets/compass-true-north.svg')}
                        alt=""
                        width={20}
                        height={20}
                        aria-hidden
                      />
                    }
                    label="Discover"
                  />
                  <PinnedRow
                    icon={
                      <img
                        src={asset('/assets/drafts.svg')}
                        alt=""
                        width={20}
                        height={20}
                        aria-hidden
                      />
                    }
                    label="Drafts"
                  />
                </CollapsibleSection>

                {favorites.length > 0 && (
                  <CollapsibleSection label="Favourites">
                    {favorites.map((c) => (
                      <SidebarChatRow key={c.id} chat={c} />
                    ))}
                  </CollapsibleSection>
                )}

                <CollapsibleSection label="Chats">
                  {recentChats.map((c) => (
                    <SidebarChatRow key={c.id} chat={c} />
                  ))}
                </CollapsibleSection>

                {/* Teams and channels — flattened tree (no Pinned/Your teams
                    subdivision). The engine marks the active channel with
                    `selected: true` so channel demos light up here. */}
                {teams.length > 0 && (
                  <CollapsibleSection label="Teams and channels">
                    {teams.flatMap((t) => renderTeamGroup(t, false))}
                  </CollapsibleSection>
                )}
              </>
            )}

            {railActive === 'communities' && (
              <div className="teams-sidebar__section" role="list">
                {pinnedTeams.length > 0 && (
                  <CollapsibleSection label="Pinned">
                    {pinnedTeams.flatMap((t) => renderTeamGroup(t, true))}
                  </CollapsibleSection>
                )}
                {yourTeams.length > 0 && (
                  <CollapsibleSection label="Your teams">
                    {yourTeams.flatMap((t) => renderTeamGroup(t, false))}
                  </CollapsibleSection>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="teams-main">
          {conversationHeader}
          {children}
        </main>
      </div>
    </div>
  )
}

function FilterPills() {
  return (
    <div className="teams-sidebar__pills" role="tablist" aria-label="Chat filter">
      <button
        type="button"
        tabIndex={-1}
        role="tab"
        aria-selected="false"
        className="teams-sidebar__pill"
      >
        Unread
      </button>
      <button
        type="button"
        tabIndex={-1}
        role="tab"
        aria-selected="false"
        className="teams-sidebar__pill"
      >
        Channels
      </button>
      <button
        type="button"
        tabIndex={-1}
        role="tab"
        aria-selected="false"
        className="teams-sidebar__pill"
      >
        Chats
      </button>
    </div>
  )
}

function PinnedRow({
  icon,
  label,
  iconWrapClass,
  selected,
}: {
  icon: ReactNode
  label: string
  iconWrapClass?: string
  selected?: boolean
}) {
  return (
    <div
      className={`teams-sidebar__pinned-row ${selected ? 'teams-sidebar__pinned-row--selected' : ''}`}
      role="listitem"
      aria-current={selected ? 'page' : undefined}
    >
      <span className={`teams-sidebar__pinned-icon ${iconWrapClass ?? ''}`}>{icon}</span>
      <span className="teams-sidebar__pinned-label">{label}</span>
    </div>
  )
}

function CollapsibleSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="teams-sidebar__section" role="list">
      <div className="teams-sidebar__section-label" aria-hidden>
        <span className="teams-sidebar__section-caret">
          <ChevronDownRegular size={14} />
        </span>
        {label}
      </div>
      {children}
    </div>
  )
}

function SidebarChatRow({ chat }: { chat: ChatSidebarEntry }) {
  const avatarColor = colorForName(chat.name)
  return (
    <div
      className={`teams-sidebar__item ${chat.selected ? 'teams-sidebar__item--selected' : ''}`}
      role="listitem"
      aria-current={chat.selected ? 'page' : undefined}
    >
      <div
        className="teams-sidebar__item-avatar"
        style={!chat.avatarUrl ? { backgroundColor: avatarColor } : undefined}
      >
        {chat.avatarUrl ? (
          <img src={chat.avatarUrl} alt="" />
        ) : (
          <span>{chat.initials ?? chat.name.slice(0, 2).toUpperCase()}</span>
        )}
        {chat.showStatus !== false && <span className="teams-sidebar__item-avatar-status" aria-hidden />}
      </div>
      <span className="teams-sidebar__item-name">{chat.name}</span>
    </div>
  )
}

/** Deterministic, accessible-contrast color from a name string. Matches the
 * Microsoft 365 / Teams avatar colour palette (rotated through a stable hash
 * so the same user always renders with the same color). */
function colorForName(name: string): string {
  const palette = [
    '#B4459C', // pink
    '#C239B3', // magenta
    '#8764B8', // purple
    '#6264A7', // brand purple
    '#4F6BED', // blue
    '#0078D4', // azure
    '#038387', // teal
    '#498205', // green
    '#CA5010', // orange
    '#D13438', // red
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

function renderTeamGroup(team: TeamSidebarTeam, pinnedSection: boolean) {
  const groupKey = `${pinnedSection ? 'pinned' : 'your'}-${team.id}`
  return [
    <div className="teams-sidebar__team" key={`${groupKey}-head`}>
      <ChevronDownRegular size={14} />
      <span className="teams-sidebar__item-channel-icon">{team.initials}</span>
      <span>{team.name}</span>
    </div>,
    ...team.channels.map((ch) => (
      <div
        key={`${groupKey}-${ch.id}`}
        className={`teams-sidebar__channel ${ch.selected ? 'teams-sidebar__channel--active' : ''} ${ch.unread ? 'teams-sidebar__channel--unread' : ''}`}
      >
        <span>{ch.name}</span>
      </div>
    )),
    <div className="teams-sidebar__see-all" key={`${groupKey}-see-all`}>
      See all channels
    </div>,
  ]
}

function TitleBar({
  meAvatarUrl,
  meInitials,
}: {
  meAvatarUrl?: string
  meInitials: string
}) {
  return (
    <div className="teams-titlebar" role="toolbar" aria-label="Teams window">
      <div className="teams-titlebar__left">
        <span className="teams-titlebar__logo" aria-hidden>
          <img src={asset('/assets/teams-logo.svg')} alt="" />
        </span>
      </div>
      <div className="teams-titlebar__center">
        <div className="teams-titlebar__nav-stack" aria-hidden>
          <button className="teams-titlebar__nav-btn" type="button" tabIndex={-1} aria-label="Back">
            <ChevronLeftRegular size={20} />
          </button>
          <button className="teams-titlebar__nav-btn" type="button" tabIndex={-1} aria-label="Forward">
            <ChevronRightRegular size={20} />
          </button>
        </div>
        <div className="teams-titlebar__search" aria-hidden>
          <SearchRegular size={20} />
          <span className="teams-titlebar__search-label">Search</span>
        </div>
      </div>
      <div className="teams-titlebar__right">
        <button className="teams-titlebar__icon-btn" type="button" tabIndex={-1} aria-label="More">
          <MoreHorizontalRegular size={20} />
        </button>
        <div className="teams-titlebar__avatar" aria-label="My account">
          {meAvatarUrl ? <img src={meAvatarUrl} alt="" /> : <span>{meInitials}</span>}
        </div>
        <WindowControls />
      </div>
    </div>
  )
}

function WindowControls() {
  return (
    <div className="teams-titlebar__wincontrols" aria-hidden>
      <button className="teams-titlebar__wincontrol" type="button" tabIndex={-1} aria-label="Minimize">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
          <path d="M3 8h10" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
        </svg>
      </button>
      <button className="teams-titlebar__wincontrol" type="button" tabIndex={-1} aria-label="Maximize">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
          <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </button>
      <button className="teams-titlebar__wincontrol teams-titlebar__wincontrol--close" type="button" tabIndex={-1} aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
        </svg>
      </button>
    </div>
  )
}

interface RailItemConfig {
  id: RailEntry
  label: string
  /** Monochrome glyph. Recolors via `currentColor`. */
  Icon?: FC<TeamsIconProps>
  ActiveIcon?: FC<TeamsIconProps>
  /** Brand glyph rendered as-is (no recolouring). When set, takes precedence
   *  over Icon / ActiveIcon. Used for Copilot. */
  Brand?: FC<TeamsIconProps>
  /** Brand glyph as a raster asset (e.g. PNG). When set, rendered as an
   *  `<img>` at the rail's icon size. Takes precedence over Brand / Icon. */
  brandImg?: string
}

const RAIL_ENTRIES: RailItemConfig[] = [
  { id: 'chat', label: 'Chat', Icon: ChatRegular, ActiveIcon: ChatFilled },
  { id: 'communities', label: 'Communities', Icon: PeopleTeamRegular, ActiveIcon: PeopleTeamFilled },
  { id: 'calls', label: 'Call to meet', Icon: VideoCameraSmallRegular },
  { id: 'onedrive', label: 'People', Icon: BookContactsRegular },
  { id: 'calendar', label: 'Calendar', Icon: CalendarRegular, ActiveIcon: CalendarFilled },
  { id: 'copilot', label: 'Copilot', Brand: CopilotBrand },
  { id: 'activity', label: 'Activity', Icon: AlertRegular },
]

function AppRail({ active }: { active: RailEntry }) {
  return (
    <nav className="teams-rail" aria-label="Teams app rail">
      {RAIL_ENTRIES.map(({ id, label, Icon, ActiveIcon, Brand, brandImg }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            tabIndex={-1}
            className={`teams-rail__item ${isActive ? 'teams-rail__item--active' : ''}`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="teams-rail__icon">
              {brandImg ? (
                <img src={brandImg} alt="" width={22} height={22} className="teams-rail__brand-img" />
              ) : Brand ? (
                <Brand size={22} />
              ) : (
                (() => {
                  const Glyph = isActive && ActiveIcon ? ActiveIcon : Icon
                  return Glyph ? <Glyph size={22} /> : null
                })()
              )}
            </span>
            <span className="teams-rail__label">{label}</span>
          </button>
        )
      })}
      <div className="teams-rail__spacer" />
      <button type="button" tabIndex={-1} className="teams-rail__item" aria-label="More">
        <span className="teams-rail__icon">
          <MoreHorizontalRegular size={22} />
        </span>
      </button>
      <button type="button" tabIndex={-1} className="teams-rail__item" aria-label="Apps">
        <span className="teams-rail__icon">
          <AppsRegular size={22} />
        </span>
        <span className="teams-rail__label">Apps</span>
      </button>
    </nav>
  )
}

/* Conversation header (used by the engine for 1:1 chat / channel) */
export interface TeamsConversationHeaderProps {
  /** When 'chat' = 1:1; when 'channel' = team channel; when 'tab' = app tab inside channel */
  kind: 'chat' | 'channel' | 'tab'
  title: string
  subtitle?: string
  /** For 1:1 chat: avatar of the other party. For channel: not used. */
  avatarUrl?: string
  /** Channel initials (e.g. "MA" for Marketing) when kind=channel/tab */
  channelInitials?: string
  /** Active tab name (e.g. "Chat" for 1:1, "Posts" for channel) */
  activeTab?: string
  /** Override the tab list. Defaults: chat=[Chat, Shared, Storyline, +]
   *  (matches the latest Teams desktop); channel=[Posts, Files, Wiki, +]. */
  tabs?: string[]
  /**
   * The conversation peer is an app/bot (e.g. a custom enterprise agent).
   * Renders a small "App" pill after the title and hides the presence dot.
   * For first-party Copilot use `kind="chat"` with `hideStatus` instead.
   */
  isBot?: boolean
  /**
   * Skip the green presence dot on the avatar. Set for Copilot or any other
   * agent where presence isn't meaningful.
   */
  hideStatus?: boolean
  /**
   * Render the simplified Copilot panel header instead of the standard chat
   * header. The Copilot panel uses a minimal chrome — a small green
   * "protected data" shield on the left and compose / open-in-new actions
   * on the right (no avatar, name, subtitle, tabs, or call/video icons).
   */
  isCopilotPanel?: boolean
}

export function TeamsConversationHeader({
  kind,
  title,
  subtitle,
  avatarUrl,
  channelInitials,
  activeTab,
  tabs,
  isBot,
  hideStatus,
  isCopilotPanel,
}: TeamsConversationHeaderProps) {
  if (isCopilotPanel) {
    return <CopilotConversationHeader />
  }

  const defaultTabs =
    kind === 'channel'
      ? ['Posts', 'Files', 'Wiki', '+']
      : kind === 'tab'
        ? ['Posts', 'Files', activeTab ?? 'App', '+']
        : ['Chat', 'Shared', 'Storyline', '+']
  const tabList = tabs ?? defaultTabs
  const currentTab = activeTab ?? (kind === 'chat' ? 'Chat' : 'Posts')

  return (
    <div className="teams-conv-header">
      <div className="teams-conv-header__title">
        {kind === 'chat' ? (
          <div
            className="teams-conv-header__avatar"
            style={!avatarUrl ? { backgroundColor: '#CA5010' } : undefined}
          >
            {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{title.slice(0, 2).toUpperCase()}</span>}
            {!isBot && !hideStatus && <span className="teams-conv-header__avatar-status" aria-hidden />}
          </div>
        ) : (
          <div className="teams-conv-header__channel-icon">
            {channelInitials ?? title.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="teams-conv-header__name-block">
          <div className="teams-conv-header__name-row">
            <span className="teams-conv-header__name">{title}</span>
            {isBot && <span className="teams-msg__app-tag">App</span>}
          </div>
          {!isBot && subtitle && <span className="teams-conv-header__sub">{subtitle}</span>}
        </div>
      </div>

      <div className="teams-conv-header__tabs" role="tablist">
        {tabList.map((t) => (
          <button
            key={t}
            type="button"
            tabIndex={-1}
            role="tab"
            aria-selected={t === currentTab}
            className={`teams-tab ${t === currentTab ? 'teams-tab--active' : ''}`}
          >
            {t === '+' ? <AddRegular size={14} /> : t}
          </button>
        ))}
      </div>

      <div className="teams-conv-header__actions">
        <button className="teams-conv-header__icon-btn teams-conv-header__icon-btn--split" type="button" tabIndex={-1} aria-label="Audio call">
          <CallRegular size={20} />
          <ChevronDownRegular size={12} className="teams-conv-header__icon-chevron" />
        </button>
        <button className="teams-conv-header__icon-btn" type="button" tabIndex={-1} aria-label="Video call">
          <VideoRegular size={20} />
        </button>
        <button className="teams-conv-header__icon-btn" type="button" tabIndex={-1} aria-label="Add people">
          <PersonAddRegular size={20} />
        </button>
        <button className="teams-conv-header__icon-btn" type="button" tabIndex={-1} aria-label="Copilot">
          <SparkleCircleRegular size={20} />
        </button>
        <button className="teams-conv-header__icon-btn" type="button" tabIndex={-1} aria-label="Search">
          <SearchRegular size={20} />
        </button>
        <button className="teams-conv-header__icon-btn" type="button" tabIndex={-1} aria-label="Open in new window">
          <WindowNewRegular size={20} />
        </button>
        <button className="teams-conv-header__icon-btn" type="button" tabIndex={-1} aria-label="More options">
          <MoreHorizontalRegular size={20} />
        </button>
      </div>
    </div>
  )
}

/**
 * Simplified header rendered when the chat surface IS the Microsoft Copilot
 * panel. Matches the new Teams desktop: no avatar, no name/subtitle, no
 * tabs, no call/video chrome — just a small green "protected data" shield
 * on the left and two right-aligned actions (compose-with-history split
 * button, open-in-new-window) in Teams brand purple.
 *
 * Visual reference: image dump from product. The shield indicates that
 * Copilot conversations are stored in the user's Microsoft 365 tenant and
 * are not used to train foundation models.
 */
function CopilotConversationHeader() {
  return (
    <div className="teams-conv-header teams-conv-header--copilot">
      <span
        className="teams-conv-header__copilot-shield"
        aria-label="Your data is protected"
        title="Your data is protected"
      >
        <ShieldCheckmarkRegular size={18} />
      </span>

      <div className="teams-conv-header__copilot-spacer" />

      <div className="teams-conv-header__copilot-actions">
        <button
          className="teams-conv-header__copilot-btn teams-conv-header__copilot-btn--split"
          type="button"
          tabIndex={-1}
          aria-label="New chat"
        >
          <ComposeRegular size={18} />
          <span className="teams-conv-header__copilot-split-divider" aria-hidden />
          <ChevronDownRegular size={14} />
        </button>
        <button
          className="teams-conv-header__copilot-btn"
          type="button"
          tabIndex={-1}
          aria-label="Open in new window"
        >
          <WindowNewRegular size={18} />
        </button>
      </div>
    </div>
  )
}

// Suppress unused-import warning for OpenRegular (kept exported in case the
// design system page wants it; not used directly by the shell).
void OpenRegular
