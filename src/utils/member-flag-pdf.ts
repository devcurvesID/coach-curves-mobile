import type { MembersGroupedByFlag } from "@/hooks/useMembersByFlag";
import dayjs from "dayjs";

interface MemberFlagPdfOptions {
  clubName: string;
  groups: MembersGroupedByFlag[];
}

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getMemberName = (member: MembersGroupedByFlag["members"][number]) =>
  member.name?.trim() || member.user?.name?.trim() || "Member";

export const buildMemberFlagPdfHtml = ({
  clubName,
  groups,
}: MemberFlagPdfOptions): string => {
  const totalMembers = groups.reduce((total, group) => total + group.total, 0);
  const summary = groups
    .map(
      (group) => `
        <div class="summary-card">
          <div class="flag">Flag ${group.flag}</div>
          <div class="count">${group.total}</div>
          <div class="caption">member</div>
        </div>`,
    )
    .join("");
  const sections = groups
    .map((group, groupIndex) => {
      const memberRows = group.members.length
        ? group.members
            .map(
              (member, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${escapeHtml(getMemberName(member))}</strong></td>
                  <td>${escapeHtml(String(member.key_tag_id ?? "").trim() || "-")}</td>
                  <td>${escapeHtml(member.total_wo ?? 0)} kali</td>
                </tr>`,
            )
            .join("")
        : "";
      const missingRows = Math.max(group.total - group.members.length, 0);
      const rows = `${memberRows}${
        missingRows > 0
          ? `<tr><td colspan="4" class="empty">${missingRows} data member belum berhasil dimuat dari API.</td></tr>`
          : group.total === 0
            ? `<tr><td colspan="4" class="empty">Belum ada member pada Flag ${group.flag}.</td></tr>`
            : ""
      }`;

      return `
        <section class="flag-section ${groupIndex > 0 ? "new-page" : ""}">
          <div class="section-heading">
            <div><div class="section-label">DAFTAR MEMBER</div><h2>Flag ${group.flag}</h2></div>
            <div class="section-total">${group.total} member</div>
          </div>
          <table>
            <thead><tr><th class="number">No.</th><th>Nama Member</th><th>Key Tag</th><th>Workout Bulan Ini</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </section>`;
    })
    .join("");

  return `<!DOCTYPE html>
  <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <style>
        @page { margin: 28px; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #1f2937; font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
        .header { padding: 24px; border-radius: 18px; color: white; background: #6F3FA0; }
        .brand { color: #e9d5ff; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; }
        h1 { margin: 6px 0 0; font-size: 24px; }
        .club { margin-top: 6px; color: #ede9fe; font-size: 13px; }
        .overall { display: flex; align-items: end; justify-content: space-between; margin-top: 16px; }
        .overall-label { color: #6b7280; font-size: 10px; text-transform: uppercase; }
        .overall-count { margin-top: 3px; color: #6F3FA0; font-size: 28px; font-weight: 700; }
        .generated { color: #9ca3af; font-size: 9px; text-align: right; }
        .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 14px; }
        .summary-card { padding: 12px 8px; border: 1px solid #ede9fe; border-radius: 12px; text-align: center; }
        .flag { color: #6F3FA0; font-size: 10px; font-weight: 700; }
        .count { margin-top: 4px; font-size: 19px; font-weight: 700; }
        .caption { color: #9ca3af; font-size: 8px; }
        .flag-section { margin-top: 20px; }
        .new-page { break-before: page; }
        .section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; }
        .section-label { color: #9ca3af; font-size: 8px; font-weight: 700; letter-spacing: 1px; }
        h2 { margin: 3px 0 0; color: #6F3FA0; font-size: 18px; }
        .section-total { padding: 7px 11px; border-radius: 20px; color: #6F3FA0; background: #f5f3ff; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 9px; color: #6b7280; background: #f5f3ff; font-size: 9px; text-align: left; }
        td { padding: 9px; border-bottom: 1px solid #e5e7eb; }
        .number { width: 42px; }
        .empty { padding: 22px; color: #6b7280; text-align: center; }
        .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 9px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header"><div class="brand">CURVES - MEMBER FLAG</div><h1>Printout Member Berdasarkan Flag</h1><div class="club">${escapeHtml(clubName)}</div></div>
      <div class="overall"><div><div class="overall-label">Total seluruh member</div><div class="overall-count">${totalMembers}</div></div><div class="generated">Dibuat pada<br />${dayjs().format("DD MMM YYYY HH:mm")}</div></div>
      <div class="summary">${summary}</div>
      ${sections}
      <div class="footer">Dokumen ini memuat seluruh member yang dikelompokkan berdasarkan status Flag A-E.</div>
    </body>
  </html>`;
};
