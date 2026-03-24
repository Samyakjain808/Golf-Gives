import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? 'noreply@golfcharity.io'

interface DrawResultEmailData {
    to: string
    name: string
    drawMonth: string
    drawnNumbers: number[]
    userNumbers: number[]
    matchCount: number
    prizeCents?: number
}

interface WinnerAlertEmailData {
    to: string
    name: string
    prizeCents: number
    drawMonth: string
}

interface SubscriptionEmailData {
    to: string
    name: string
    plan: string
    nextBillingDate: string
    status: string
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export async function sendDrawResultEmail(data: DrawResultEmailData): Promise<void> {
    const isWinner = data.matchCount >= 3
    const subject = isWinner
        ? `🎉 You won ${formatCurrency(data.prizeCents ?? 0)} in the Golf Charity Draw!`
        : `Golf Charity Draw Result - ${data.drawMonth}`

    await resend.emails.send({
        from: FROM,
        to: data.to,
        subject,
        html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f5ee;">
        <div style="background: #1a3a2a; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #d4a853; margin: 0; font-size: 28px;">Golf Charity Draw</h1>
          <p style="color: #a8c5b5; margin: 8px 0 0;">${data.drawMonth}</p>
        </div>
        
        <p style="color: #333; font-size: 16px;">Hi ${data.name},</p>
        
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin: 16px 0;">
          <h2 style="color: #1a3a2a; margin: 0 0 16px;">Drawn Numbers</h2>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            ${data.drawnNumbers.map(n => `<span style="background: #d4a853; color: #1a3a2a; border-radius: 50%; width: 48px; height: 48px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">${n}</span>`).join('')}
          </div>
        </div>
        
        <div style="background: ${isWinner ? '#e8f5e9' : '#fff5f5'}; border-radius: 12px; padding: 24px; margin: 16px 0;">
          <h2 style="color: #1a3a2a; margin: 0 0 8px;">Your Result</h2>
          <p style="margin: 0; color: #333;">Matched: <strong>${data.matchCount} numbers</strong></p>
          ${isWinner ? `<p style="color: #2e7d32; font-size: 20px; font-weight: bold; margin: 8px 0 0;">Prize: ${formatCurrency(data.prizeCents ?? 0)} 🎉</p>` : '<p style="color: #666; margin: 8px 0 0;">Better luck next month!</p>'}
        </div>
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #1a3a2a; color: #d4a853; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Dashboard</a>
        </div>
      </div>
    `,
    })
}

export async function sendWinnerAlertEmail(data: WinnerAlertEmailData): Promise<void> {
    await resend.emails.send({
        from: FROM,
        to: data.to,
        subject: `🏆 Winner Alert: Please Submit Your Proof`,
        html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f5ee;">
        <div style="background: #1a3a2a; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #d4a853; margin: 0;">Congratulations!</h1>
        </div>
        <p style="color: #333; font-size: 16px;">Hi ${data.name},</p>
        <p style="color: #333;">You've won <strong>${formatCurrency(data.prizeCents)}</strong> in the ${data.drawMonth} Golf Charity Draw!</p>
        <p style="color: #333;">To receive your prize, please upload verification proof in your dashboard.</p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" style="background: #d4a853; color: #1a3a2a; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Upload Proof Now</a>
        </div>
      </div>
    `,
    })
}

export async function sendSubscriptionEmail(data: SubscriptionEmailData): Promise<void> {
    const isActive = data.status === 'active'
    const subject = isActive
        ? `✅ Subscription Confirmed - Welcome to Golf Charity!`
        : `Subscription Update - Golf Charity`

    await resend.emails.send({
        from: FROM,
        to: data.to,
        subject,
        html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f5ee;">
        <div style="background: #1a3a2a; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #d4a853; margin: 0;">Golf Charity</h1>
        </div>
        <p style="color: #333;">Hi ${data.name},</p>
        <p style="color: #333;">Your <strong>${data.plan}</strong> subscription is now <strong>${data.status}</strong>.</p>
        ${isActive ? `<p style="color: #333;">Next billing date: <strong>${data.nextBillingDate}</strong></p>` : ''}
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #1a3a2a; color: #d4a853; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
        </div>
      </div>
    `,
    })
}
