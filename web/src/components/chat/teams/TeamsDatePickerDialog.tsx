import { useState } from 'react'
import { CalendarRegular, DismissRegular } from '@/components/icons/teams'

interface TeamsDatePickerDialogProps {
  title?: string
  defaultStart?: string
  defaultEnd?: string
  onSubmit: () => void
  onCancel?: () => void
}

export function TeamsDatePickerDialog({
  title = 'Select Leave Dates',
  defaultStart = '2026-03-15',
  defaultEnd = '2026-03-22',
  onSubmit,
  onCancel,
}: TeamsDatePickerDialogProps) {
  const [start, setStart] = useState(defaultStart)
  const [end, setEnd] = useState(defaultEnd)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="teams-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="teams-dialog-title">
      <form
        className="teams-dialog"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="teams-dialog__header">
          <div className="flex items-center gap-2">
            <CalendarRegular size={20} />
            <span className="teams-dialog__title" id="teams-dialog-title">
              {title}
            </span>
          </div>
          {onCancel && (
            <button
              type="button"
              className="teams-sidebar__icon-btn"
              aria-label="Close"
              onClick={onCancel}
            >
              <DismissRegular size={20} />
            </button>
          )}
        </div>
        <div className="teams-dialog__body">
          <label className="teams-dialog__field">
            <span className="teams-dialog__label">Start date</span>
            <input
              type="date"
              className="teams-dialog__input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="teams-dialog__field">
            <span className="teams-dialog__label">End date</span>
            <input
              type="date"
              className="teams-dialog__input"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        <div className="teams-dialog__footer">
          {onCancel && (
            <button
              type="button"
              className="teams-action-btn teams-action-btn--secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="teams-action-btn">
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}
