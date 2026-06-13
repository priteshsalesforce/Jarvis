/** @jsxImportSource react */
/**
 * Lucide → Fluent UI System Icons adapter.
 *
 * The Jarvis app was authored against `lucide-react`, which is not part of the
 * Microsoft Teams / Fluent design system. This module re-exports the official
 * Fluent System Icons (@fluentui/react-icons) under the exact names the app
 * already imports, wrapped so they keep Lucide's `size` / `color` prop API.
 * App.jsx therefore only changes its import source — every call site
 * (`<Bell size={11} />`, `Icon: LayoutDashboard`, …) keeps working unchanged.
 *
 * Fluent resizable icons render at `1em`, so `size` maps to `fontSize` and
 * `color` maps to `currentColor`. Lucide-only props (strokeWidth, fill) are
 * accepted and ignored because Fluent glyphs are solid, not stroked.
 */
import type { CSSProperties, FC } from 'react'
import {
  AddRegular,
  AlertRegular,
  ArrowClockwiseRegular,
  ArrowLeftRegular,
  ArrowMaximizeRegular,
  ArrowRightRegular,
  ArrowTrendingLinesRegular,
  BoardRegular,
  BookOpenRegular,
  BotRegular,
  BrainRegular,
  BranchForkRegular,
  BriefcaseRegular,
  CalendarRegular,
  CallRegular,
  CheckmarkCircleRegular,
  CheckmarkRegular,
  ChatRegular,
  ChevronDownRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  ClockRegular,
  CloudRegular,
  CommentRegular,
  CompassNorthwestRegular,
  CopyRegular,
  DatabaseRegular,
  DeleteRegular,
  DismissRegular,
  DocumentRegular,
  DrinkCoffeeRegular,
  DumbbellRegular,
  EditRegular,
  FilterRegular,
  FlagRegular,
  FlashRegular,
  FolderRegular,
  GlobeRegular,
  HistoryRegular,
  InfoRegular,
  LayerRegular,
  LeafOneRegular,
  LightbulbRegular,
  LocationRegular,
  LockClosedRegular,
  MailRegular,
  MicRegular,
  MoreHorizontalRegular,
  NumberSymbolRegular,
  OpenRegular,
  OptionsRegular,
  PeopleRegular,
  PersonCircleRegular,
  PinOffRegular,
  PinRegular,
  PowerRegular,
  PulseRegular,
  QuestionCircleRegular,
  SearchRegular,
  SendRegular,
  SettingsRegular,
  ShieldCheckmarkRegular,
  SignOutRegular,
  SparkleRegular,
  SquareRegular,
  StarRegular,
  SubtractRegular,
  TagRegular,
  ThumbDislikeRegular,
  ThumbLikeRegular,
  VideoRegular,
  WandRegular,
  WarningRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
  Wifi1Regular,
  WifiOffRegular,
  type FluentIcon,
} from '@fluentui/react-icons'

interface IconProps {
  size?: number | string
  color?: string
  className?: string
  style?: CSSProperties
  /** Accepted for Lucide compatibility, ignored (Fluent glyphs are solid). */
  strokeWidth?: number | string
  absoluteStrokeWidth?: boolean
  fill?: string
  [key: string]: unknown
}

function adapt(Icon: FluentIcon): FC<IconProps> {
  function FluentAdapter({
    size = 20,
    color,
    style,
    // strip Lucide-only props so they don't hit the SVG
    strokeWidth: _sw,
    absoluteStrokeWidth: _asw,
    fill: _fill,
    ...rest
  }: IconProps) {
    return <Icon {...rest} style={{ fontSize: size, color, ...style }} />
  }
  FluentAdapter.displayName = `Fluent(${Icon.displayName ?? 'Icon'})`
  return FluentAdapter
}

export const Bell = adapt(AlertRegular)
export const CheckCircle2 = adapt(CheckmarkCircleRegular)
export const MessageCircle = adapt(ChatRegular)
export const ExternalLink = adapt(OpenRegular)
export const Plus = adapt(AddRegular)
export const Settings = adapt(SettingsRegular)
export const Users = adapt(PeopleRegular)
export const AlertTriangle = adapt(WarningRegular)
export const Calendar = adapt(CalendarRegular)
export const Clock = adapt(ClockRegular)
export const ArrowRight = adapt(ArrowRightRegular)
export const Send = adapt(SendRegular)
export const Mic = adapt(MicRegular)
export const X = adapt(DismissRegular)
export const Check = adapt(CheckmarkRegular)
export const Loader2 = adapt(ArrowClockwiseRegular)
export const LogOut = adapt(SignOutRegular)
export const ChevronLeft = adapt(ChevronLeftRegular)
export const Sparkles = adapt(SparkleRegular)
export const Activity = adapt(PulseRegular)
export const ShieldCheck = adapt(ShieldCheckmarkRegular)
export const Zap = adapt(FlashRegular)
export const TrendingUp = adapt(ArrowTrendingLinesRegular)
export const FileText = adapt(DocumentRegular)
export const MessageSquare = adapt(CommentRegular)
export const Lock = adapt(LockClosedRegular)
export const Database = adapt(DatabaseRegular)
export const LayoutDashboard = adapt(BoardRegular)
export const History = adapt(HistoryRegular)
export const Sliders = adapt(OptionsRegular)
export const ChevronRight = adapt(ChevronRightRegular)
export const ChevronDown = adapt(ChevronDownRegular)
export const Hash = adapt(NumberSymbolRegular)
export const HashIcon = adapt(NumberSymbolRegular)
export const Moon = adapt(WeatherMoonRegular)
export const Sun = adapt(WeatherSunnyRegular)
export const MapPin = adapt(LocationRegular)
export const Video = adapt(VideoRegular)
export const UserCircle2 = adapt(PersonCircleRegular)
export const Maximize2 = adapt(ArrowMaximizeRegular)
export const Bot = adapt(BotRegular)
export const Tag = adapt(TagRegular)
export const Folder = adapt(FolderRegular)
export const Search = adapt(SearchRegular)
export const Filter = adapt(FilterRegular)
export const Star = adapt(StarRegular)
export const Wifi = adapt(Wifi1Regular)
export const WifiOff = adapt(WifiOffRegular)
export const Power = adapt(PowerRegular)
export const Edit2 = adapt(EditRegular)
export const Trash2 = adapt(DeleteRegular)
export const Copy = adapt(CopyRegular)
export const Globe = adapt(GlobeRegular)
export const ThumbsUp = adapt(ThumbLikeRegular)
export const ThumbsDown = adapt(ThumbDislikeRegular)
export const Info = adapt(InfoRegular)
export const Flag = adapt(FlagRegular)
export const Coffee = adapt(DrinkCoffeeRegular)
export const Brain = adapt(BrainRegular)
export const Leaf = adapt(LeafOneRegular)
export const Dumbbell = adapt(DumbbellRegular)
export const BookOpen = adapt(BookOpenRegular)
export const Phone = adapt(CallRegular)
export const ArrowLeft = adapt(ArrowLeftRegular)
export const MoreHorizontal = adapt(MoreHorizontalRegular)
export const Minus = adapt(SubtractRegular)
export const Square = adapt(SquareRegular)
export const Compass = adapt(CompassNorthwestRegular)
export const Wand2 = adapt(WandRegular)
export const PenSquare = adapt(EditRegular)
export const Lightbulb = adapt(LightbulbRegular)
export const Cloud = adapt(CloudRegular)
export const Mail = adapt(MailRegular)
export const Briefcase = adapt(BriefcaseRegular)
export const Layers = adapt(LayerRegular)
export const LifeBuoy = adapt(QuestionCircleRegular)
export const GitBranch = adapt(BranchForkRegular)
export const Pin = adapt(PinRegular)
export const PinOff = adapt(PinOffRegular)
