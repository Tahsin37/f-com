import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { workerName, workerEmail, storeName, permissions, loginUrl } = body

    if (!workerEmail) {
      return NextResponse.json({ error: "Worker email is required" }, { status: 400 })
    }

    // Build permissions list for the email
    const permLabels: Record<string, string> = {
      can_add_product: "Add Products",
      can_edit_product: "Edit Products",
      can_delete_product: "Delete Products",
      can_manage_orders: "Manage Orders",
      can_view_analytics: "View Analytics",
      can_manage_pos: "Use POS",
    }

    const grantedPerms = Object.entries(permissions || {})
      .filter(([, v]) => v)
      .map(([k]) => permLabels[k] || k)

    const permissionsHtml = grantedPerms.length > 0
      ? grantedPerms.map(p => `<li style="padding:4px 0;color:#333">✅ ${p}</li>`).join("")
      : `<li style="padding:4px 0;color:#888">No specific permissions assigned yet</li>`

    const { data, error } = await resend.emails.send({
      from: "F-Manager <onboarding@resend.dev>",
      to: [workerEmail],
      subject: `🎉 You've been added as a worker at ${storeName}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:32px 32px 28px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.3px">F-Manager</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px">Team Invitation</p>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111">Welcome aboard, ${workerName}! 👋</h2>
      <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6">
        You've been added as a team member at <strong style="color:#0d9488">${storeName}</strong>. 
        You can now help manage the store with the permissions listed below.
      </p>

      <!-- Permissions -->
      <div style="background:#f0fdfa;border:1px solid #ccfbf1;border-radius:12px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0d9488">Your Permissions:</p>
        <ul style="margin:0;padding:0 0 0 4px;list-style:none;font-size:13px">
          ${permissionsHtml}
        </ul>
      </div>

      <!-- CTA Button -->
      <a href="${loginUrl}" 
         style="display:block;text-align:center;background:#0d9488;color:#fff;text-decoration:none;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:0.3px">
        Sign In to Dashboard →
      </a>

      <p style="margin:20px 0 0;color:#999;font-size:11px;text-align:center;line-height:1.5">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#fafaf9;padding:16px 32px;text-align:center;border-top:1px solid #f0f0f0">
      <p style="margin:0;color:#bbb;font-size:11px">Powered by F-Manager · Team Sifr</p>
    </div>
  </div>
</body>
</html>
            `.trim(),
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send invitation email. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err: any) {
    console.error("Invite API error:", err)
    return NextResponse.json({ error: "Failed to send invitation. Please try again." }, { status: 500 })
  }
}
