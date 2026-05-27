export type ProjectStatus = "in-progress" | "pending" | "completed" | "review" | "on-hold";

export type Project = {
  id: string;
  name: string;
  client: string;
  clientId: string;
  adminId?: string;
  category: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  team: { name: string; initials: string; color: string }[];
  description: string;
};

export const clients = [
  { id: "c-001", name: "Acme Corp" },
  { id: "c-002", name: "ShopNow" },
  { id: "c-003", name: "DataFlow" },
  { id: "c-004", name: "Kopinesia" },
  { id: "c-005", name: "PayGate" },
  { id: "c-006", name: "TechNova" },
];

export const projects: Project[] = [
  { id: "p-001", name: "Redesign Landing Page Acme", client: "Acme Corp", clientId: "c-001", adminId: "u-admin", category: "UI/UX Design", status: "in-progress", progress: 68, deadline: "2026-06-12", team: [{name:"Andi", initials:"AN", color:"oklch(0.7 0.15 200)"},{name:"Sari", initials:"SR", color:"oklch(0.65 0.16 155)"},{name:"Budi", initials:"BD", color:"oklch(0.78 0.15 75)"}], description: "Redesign halaman utama dengan style modern dan konversi tinggi." },
  { id: "p-002", name: "Mobile App E-commerce", client: "ShopNow", clientId: "c-002", adminId: "u-admin", category: "Mobile Development", status: "review", progress: 92, deadline: "2026-05-28", team: [{name:"Rina", initials:"RN", color:"oklch(0.65 0.2 320)"},{name:"Tono", initials:"TN", color:"oklch(0.58 0.18 255)"}], description: "Aplikasi mobile cross-platform dengan fitur checkout & payment gateway." },
  { id: "p-003", name: "Dashboard Analytics SaaS", client: "DataFlow", clientId: "c-003", adminId: "u-admin", category: "Web Development", status: "in-progress", progress: 45, deadline: "2026-07-04", team: [{name:"Dewi", initials:"DW", color:"oklch(0.7 0.13 200)"},{name:"Eka", initials:"EK", color:"oklch(0.65 0.16 155)"}], description: "Dashboard analytics realtime untuk produk SaaS." },
  { id: "p-004", name: "Brand Identity Kopinesia", client: "Kopinesia", clientId: "c-004", category: "Branding", status: "completed", progress: 100, deadline: "2026-05-01", team: [{name:"Fani", initials:"FN", color:"oklch(0.78 0.15 75)"}], description: "Brand identity lengkap untuk coffee shop chain." },
  { id: "p-005", name: "API Integration Stripe", client: "PayGate", clientId: "c-005", category: "Backend", status: "pending", progress: 8, deadline: "2026-06-30", team: [{name:"Gita", initials:"GT", color:"oklch(0.58 0.18 255)"}], description: "Integrasi pembayaran Stripe untuk multi-currency." },
  { id: "p-006", name: "Migrasi Server Cloud", client: "TechNova", clientId: "c-006", category: "DevOps", status: "on-hold", progress: 30, deadline: "2026-08-15", team: [{name:"Hadi", initials:"HD", color:"oklch(0.65 0.2 320)"},{name:"Indra", initials:"IN", color:"oklch(0.7 0.13 200)"}], description: "Migrasi infrastruktur dari on-prem ke cloud." },
];

export const activityLog = [
  { id: 1, user: "Andi", action: "mengunggah file design-v3.fig", time: "2 jam lalu", type: "upload" },
  { id: 2, user: "Sari", action: "menandai milestone Wireframe selesai", time: "5 jam lalu", type: "milestone" },
  { id: 3, user: "Admin", action: "menugaskan Budi ke project", time: "kemarin", type: "assign" },
  { id: 4, user: "Andi", action: "memperbarui progress ke 68%", time: "kemarin", type: "update" },
  { id: 5, user: "Client", action: "memberikan revisi pada halaman hero", time: "2 hari lalu", type: "revision" },
];

export const messages = [
  { id: 1, user: "Andi", initials: "AN", color: "oklch(0.7 0.15 200)", text: "Halo, draft pertama sudah siap untuk direview ya.", time: "09:24", me: false },
  { id: 2, user: "Saya", initials: "ME", color: "oklch(0.58 0.18 255)", text: "Oke, segera saya cek. Terima kasih!", time: "09:30", me: true },
  { id: 3, user: "Sari", initials: "SR", color: "oklch(0.65 0.16 155)", text: "Saya sudah upload aset baru di folder /assets.", time: "10:02", me: false },
  { id: 4, user: "Saya", initials: "ME", color: "oklch(0.58 0.18 255)", text: "Catatan revisi sudah saya tulis di dokumen.", time: "10:15", me: true },
];

export const notifications = [
  { id: 1, title: "Project Mobile App E-commerce siap direview", time: "10 menit lalu", read: false },
  { id: 2, title: "Andi mengunggah file baru", time: "2 jam lalu", read: false },
  { id: 3, title: "Deadline Dashboard Analytics dalam 7 hari", time: "kemarin", read: true },
  { id: 4, title: "Project Brand Identity Kopinesia selesai", time: "3 hari lalu", read: true },
];

export const files = [
  { id: 1, name: "design-v3.fig", size: "12.4 MB", type: "Figma", date: "20 Mei 2026" },
  { id: 2, name: "brief-project.pdf", size: "1.2 MB", type: "PDF", date: "12 Mei 2026" },
  { id: 3, name: "logo-assets.zip", size: "8.7 MB", type: "ZIP", date: "10 Mei 2026" },
  { id: 4, name: "wireframe.png", size: "2.3 MB", type: "Image", date: "8 Mei 2026" },
];

export const staff = [
  { id: 1, name: "Andi Pratama", role: "UI/UX Designer", projects: 5, status: "active", initials: "AN", color: "oklch(0.7 0.15 200)" },
  { id: 2, name: "Sari Wulandari", role: "Frontend Dev", projects: 3, status: "active", initials: "SR", color: "oklch(0.65 0.16 155)" },
  { id: 3, name: "Budi Santoso", role: "Backend Dev", projects: 4, status: "active", initials: "BD", color: "oklch(0.78 0.15 75)" },
  { id: 4, name: "Rina Kartika", role: "Project Manager", projects: 6, status: "active", initials: "RN", color: "oklch(0.65 0.2 320)" },
  { id: 5, name: "Tono Hardian", role: "Mobile Dev", projects: 2, status: "leave", initials: "TN", color: "oklch(0.58 0.18 255)" },
];

export const monthlyData = [
  { month: "Jan", completed: 4, active: 8 },
  { month: "Feb", completed: 6, active: 10 },
  { month: "Mar", completed: 5, active: 12 },
  { month: "Apr", completed: 8, active: 11 },
  { month: "Mei", completed: 10, active: 14 },
  { month: "Jun", completed: 7, active: 16 },
];

export const categoryData = [
  { name: "UI/UX", value: 28 },
  { name: "Web Dev", value: 22 },
  { name: "Mobile", value: 18 },
  { name: "Branding", value: 12 },
  { name: "DevOps", value: 8 },
];

export const statusLabel: Record<ProjectStatus, string> = {
  "in-progress": "In Progress",
  "pending": "Pending",
  "completed": "Completed",
  "review": "Review",
  "on-hold": "On Hold",
};
