export const BRAND = {
  primary: '#6366f1',
  purple:  '#8b5cf6',
  bg:      '#0f0f1a',
  card:    '#1a1a2e',
  border:  '#2a2a4a',
  text:    '#e2e8f0',
  muted:   '#94a3b8',
  green:   '#10b981',
  coral:   '#f97316',
}

function base(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CareCircle</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;" cellpadding="0" cellspacing="0">

        <!-- Logo -->
        <tr><td style="padding-bottom:28px;text-align:center;">
          <table cellpadding="0" cellspacing="0" style="display:inline-table;">
            <tr>
              <td style="background:linear-gradient(135deg,${BRAND.primary},${BRAND.purple});border-radius:12px;padding:10px 14px;vertical-align:middle;">
                <span style="color:white;font-size:18px;">&#10084;</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle;">
                <span style="color:white;font-size:20px;font-weight:800;letter-spacing:-0.5px;">CareCircle</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:20px;padding:36px 40px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:28px;text-align:center;">
          <p style="color:#475569;font-size:12px;margin:0 0 6px;">
            You're receiving this because you're part of a CareCircle family.
          </p>
          <p style="color:#334155;font-size:12px;margin:0;">
            <a href="{{unsubscribe_url}}" style="color:#475569;text-decoration:underline;">Manage notifications</a>
            &nbsp;&middot;&nbsp;
            <a href="https://carecircle.app" style="color:#475569;text-decoration:underline;">carecircle.app</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(label: string, url: string, color = BRAND.primary): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
    <tr><td style="background:linear-gradient(135deg,${color},${BRAND.purple});border-radius:12px;">
      <a href="${url}" style="display:inline-block;color:white;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;">${label}</a>
    </td></tr>
  </table>`
}

function tag(label: string, color: string): string {
  return `<span style="display:inline-block;background:${color}22;color:${color};font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;padding:4px 10px;border-radius:20px;">${label}</span>`
}

// ─────────────────────────────────────────
// WELCOME EMAIL
// ─────────────────────────────────────────
export function welcomeEmail(name: string, appUrl: string): { subject: string; html: string } {
  return {
    subject: `Welcome to CareCircle, ${name.split(' ')[0]}! 🩵`,
    html: base(`
      <h1 style="color:white;font-size:26px;font-weight:900;margin:0 0 8px;letter-spacing:-0.5px;">
        Welcome to CareCircle, ${name.split(' ')[0]}!
      </h1>
      <p style="color:${BRAND.muted};font-size:15px;line-height:1.6;margin:0 0 24px;">
        Your family's command center for elder care is ready. Here's what you can do right now:
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
          ['📋', 'Create tasks', 'Assign to-dos to family members and track completion together.'],
          ['📅', 'Log care entries', 'Keep a shared timeline of every visit, medication, and appointment.'],
          ['👨‍👩‍👧', 'Invite your family', 'Add siblings and other caregivers to your circle.'],
        ].map(([icon, title, desc]) => `
          <tr><td style="padding-bottom:16px;">
            <table cellpadding="0" cellspacing="0" style="background:#ffffff08;border-radius:14px;padding:16px;width:100%;">
              <tr>
                <td style="font-size:22px;width:40px;vertical-align:top;padding-right:14px;">${icon}</td>
                <td>
                  <p style="color:white;font-weight:700;font-size:14px;margin:0 0 4px;">${title}</p>
                  <p style="color:${BRAND.muted};font-size:13px;margin:0;line-height:1.5;">${desc}</p>
                </td>
              </tr>
            </table>
          </td></tr>
        `).join('')}
      </table>

      ${btn('Go to Your Dashboard', appUrl)}
    `, `Welcome to CareCircle — your family care coordination hub`),
  }
}

// ─────────────────────────────────────────
// TASK ASSIGNED EMAIL
// ─────────────────────────────────────────
export function taskAssignedEmail(opts: {
  assigneeName: string
  assignerName: string
  taskTitle: string
  priority: string
  dueDate: string | null
  recipientName: string
  appUrl: string
}): { subject: string; html: string } {
  const priorityColor = opts.priority === 'high' ? '#ef4444' : opts.priority === 'medium' ? '#f59e0b' : BRAND.green
  return {
    subject: `New task assigned: ${opts.taskTitle}`,
    html: base(`
      <p style="margin:0 0 20px;">${tag('New Task', BRAND.primary)}</p>
      <h1 style="color:white;font-size:22px;font-weight:900;margin:0 0 6px;letter-spacing:-0.3px;">
        You've been assigned a task
      </h1>
      <p style="color:${BRAND.muted};font-size:14px;margin:0 0 28px;">
        ${opts.assignerName} assigned this to you for ${opts.recipientName}'s care.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff08;border-radius:16px;padding:20px;">
        <tr><td>
          <p style="color:white;font-weight:800;font-size:17px;margin:0 0 14px;">${opts.taskTitle}</p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:16px;">${tag(opts.priority + ' priority', priorityColor)}</td>
              ${opts.dueDate ? `<td><span style="color:${BRAND.muted};font-size:13px;">Due ${opts.dueDate}</span></td>` : ''}
            </tr>
          </table>
        </td></tr>
      </table>

      ${btn('View Task', opts.appUrl)}

      <p style="color:${BRAND.muted};font-size:12px;margin:20px 0 0;">
        Assigned by ${opts.assignerName} · Mark complete in the app when done.
      </p>
    `, `${opts.assignerName} assigned you a task in CareCircle`),
  }
}

// ─────────────────────────────────────────
// CARE FEED ENTRY EMAIL
// ─────────────────────────────────────────
export function feedEntryEmail(opts: {
  recipientName: string
  authorName: string
  category: string
  body: string
  appUrl: string
}): { subject: string; html: string } {
  const catEmoji: Record<string, string> = {
    medication: '💊', medical: '🩺', personal: '💬',
    note: '📝', nutrition: '🥗', activity: '🏃',
    incident: '⚠️', financial: '💰',
  }
  const emoji = catEmoji[opts.category] ?? '📋'
  return {
    subject: `${opts.authorName} logged a care update for ${opts.recipientName}`,
    html: base(`
      <p style="margin:0 0 20px;">${tag(opts.category, BRAND.primary)}</p>
      <h1 style="color:white;font-size:22px;font-weight:900;margin:0 0 6px;letter-spacing:-0.3px;">
        New care update
      </h1>
      <p style="color:${BRAND.muted};font-size:14px;margin:0 0 28px;">
        ${opts.authorName} logged an update for ${opts.recipientName}.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff08;border:1px solid ${BRAND.border};border-radius:16px;padding:20px;">
        <tr>
          <td style="font-size:28px;vertical-align:top;padding-right:16px;width:44px;">${emoji}</td>
          <td>
            <p style="color:white;font-size:15px;line-height:1.6;margin:0;">${opts.body}</p>
            <p style="color:${BRAND.muted};font-size:12px;margin:10px 0 0;">— ${opts.authorName}</p>
          </td>
        </tr>
      </table>

      ${btn('View Full Care Feed', opts.appUrl)}
    `, `${opts.authorName} logged a care update — ${opts.body.slice(0, 80)}...`),
  }
}

// ─────────────────────────────────────────
// FAMILY INVITE EMAIL
// ─────────────────────────────────────────
export function inviteEmail(opts: {
  inviterName: string
  recipientName: string
  inviteUrl: string
}): { subject: string; html: string } {
  return {
    subject: `${opts.inviterName} invited you to care for ${opts.recipientName} on CareCircle`,
    html: base(`
      <h1 style="color:white;font-size:24px;font-weight:900;margin:0 0 10px;letter-spacing:-0.5px;">
        You've been invited to join a care circle
      </h1>
      <p style="color:${BRAND.muted};font-size:15px;line-height:1.6;margin:0 0 28px;">
        <strong style="color:white;">${opts.inviterName}</strong> is coordinating care for
        <strong style="color:white;">${opts.recipientName}</strong> and wants you involved.
        CareCircle keeps your whole family on the same page.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
          ['📋', 'Shared task board so nothing falls through the cracks'],
          ['📅', 'Unified care calendar for all appointments'],
          ['💰', 'Expense tracking and fair cost splitting'],
          ['📁', 'Secure document vault for important paperwork'],
        ].map(([icon, text]) => `
          <tr><td style="padding-bottom:12px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:18px;width:32px;">${icon}</td>
                <td style="color:${BRAND.muted};font-size:14px;line-height:1.5;">${text}</td>
              </tr>
            </table>
          </td></tr>
        `).join('')}
      </table>

      ${btn('Accept Invitation', opts.inviteUrl, BRAND.coral)}

      <p style="color:${BRAND.muted};font-size:12px;margin:20px 0 0;line-height:1.5;">
        This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
      </p>
    `, `${opts.inviterName} wants you to join ${opts.recipientName}'s care circle`),
  }
}

// ─────────────────────────────────────────
// WEEKLY DIGEST EMAIL
// ─────────────────────────────────────────
export function weeklyDigestEmail(opts: {
  userName: string
  recipientName: string
  weekOf: string
  tasksCompleted: number
  tasksPending: number
  feedEntries: number
  totalExpenses: string
  topEntries: Array<{ category: string; body: string; author: string }>
  appUrl: string
}): { subject: string; html: string } {
  return {
    subject: `Your CareCircle weekly summary — week of ${opts.weekOf}`,
    html: base(`
      <p style="margin:0 0 20px;">${tag('Weekly Digest', BRAND.green)}</p>
      <h1 style="color:white;font-size:22px;font-weight:900;margin:0 0 6px;letter-spacing:-0.3px;">
        This week caring for ${opts.recipientName}
      </h1>
      <p style="color:${BRAND.muted};font-size:14px;margin:0 0 28px;">Week of ${opts.weekOf}</p>

      <!-- Stats row -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          ${[
            [String(opts.tasksCompleted), 'Tasks completed', BRAND.green],
            [String(opts.tasksPending),   'Tasks pending',   BRAND.coral],
            [String(opts.feedEntries),    'Care log entries', BRAND.primary],
            [opts.totalExpenses,          'Expenses logged', '#8b5cf6'],
          ].map(([val, label, color]) => `
            <td style="width:25%;padding:0 4px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff08;border-radius:14px;padding:14px 8px;">
                <tr><td style="text-align:center;">
                  <p style="color:${color};font-size:24px;font-weight:900;margin:0 0 4px;">${val}</p>
                  <p style="color:${BRAND.muted};font-size:11px;margin:0;line-height:1.4;">${label}</p>
                </td></tr>
              </table>
            </td>
          `).join('')}
        </tr>
      </table>

      <!-- Recent entries -->
      ${opts.topEntries.length > 0 ? `
        <p style="color:white;font-weight:700;font-size:14px;margin:0 0 12px;">Recent care highlights</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${opts.topEntries.map(e => `
            <tr><td style="padding-bottom:10px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff06;border-radius:12px;padding:14px;">
                <tr>
                  <td>
                    <p style="color:white;font-size:13px;line-height:1.5;margin:0 0 6px;">${e.body.slice(0, 120)}${e.body.length > 120 ? '...' : ''}</p>
                    <p style="color:${BRAND.muted};font-size:11px;margin:0;">${e.author} · ${e.category}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          `).join('')}
        </table>
      ` : ''}

      ${btn('View Full Dashboard', opts.appUrl)}
    `, `CareCircle weekly summary — ${opts.tasksCompleted} tasks done, ${opts.feedEntries} care entries`),
  }
}
