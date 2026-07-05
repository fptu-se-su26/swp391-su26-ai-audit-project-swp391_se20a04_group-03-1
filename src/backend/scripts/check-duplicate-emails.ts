/**
 * Rà email trùng TRƯỚC khi bật unique index cho:
 *   - Company.email
 *   - ContainerProvider.contact_email
 *
 * Chạy:  npx ts-node scripts/check-duplicate-emails.ts   (từ thư mục backend)
 *
 * Vì sao cần chạy:
 *   MongoDB sẽ TỪ CHỐI build unique index nếu collection đang có 2+ document
 *   trùng giá trị (KỂ CẢ document đã soft-delete isDeleted: true). Script này
 *   liệt kê mọi nhóm trùng để bạn xử lý (đổi email / xóa vĩnh viễn) trước.
 *
 * Script CHỈ ĐỌC — không sửa gì cả. An toàn chạy bao nhiêu lần cũng được.
 *
 * Báo cáo 2 loại:
 *   1. TRÙNG TUYỆT ĐỐI (exact)      -> sẽ làm build unique index THẤT BẠI.
 *   2. TRÙNG KHÔNG PHÂN BIỆT HOA/THƯỜNG (case-insensitive) -> chỉ CẢNH BÁO;
 *      unique index mặc định phân biệt hoa/thường nên không chặn, nhưng dễ gây
 *      nhầm lẫn cho người dùng (a@x.com vs A@x.com).
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Company } from "../models/company.model";
import { ContainerProvider } from "../models/container-provider.model";

type DupGroup = {
  value: string;
  docs: { id: string; isDeleted: boolean; label: string }[];
};

async function findExactDuplicates(
  model: mongoose.Model<any>,
  field: string,
  labelFields: string[],
): Promise<DupGroup[]> {
  const groups = await model.aggregate([
    { $match: { [field]: { $ne: null } } },
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
        docs: {
          $push: {
            id: "$_id",
            isDeleted: "$isDeleted",
            fields: labelFields.reduce(
              (acc, f) => ({ ...acc, [f]: `$${f}` }),
              {} as Record<string, string>,
            ),
          },
        },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return groups.map((g: any) => ({
    value: g._id,
    docs: g.docs.map((d: any) => ({
      id: String(d.id),
      isDeleted: !!d.isDeleted,
      label: labelFields.map((f) => d.fields[f]).filter(Boolean).join(" · "),
    })),
  }));
}

async function findCaseInsensitiveDuplicates(
  model: mongoose.Model<any>,
  field: string,
): Promise<DupGroup[]> {
  const groups = await model.aggregate([
    { $match: { [field]: { $ne: null } } },
    {
      $group: {
        _id: { $toLower: `$${field}` },
        count: { $sum: 1 },
        distinctValues: { $addToSet: `$${field}` },
        docs: {
          $push: { id: "$_id", value: `$${field}`, isDeleted: "$isDeleted" },
        },
      },
    },
    // Chỉ giữ nhóm có >1 document VÀ khác nhau về hoa/thường
    {
      $match: {
        count: { $gt: 1 },
        $expr: { $gt: [{ $size: "$distinctValues" }, 1] },
      },
    },
  ]);

  return groups.map((g: any) => ({
    value: g._id,
    docs: g.docs.map((d: any) => ({
      id: String(d.id),
      isDeleted: !!d.isDeleted,
      label: d.value,
    })),
  }));
}

function printReport(title: string, exact: DupGroup[], ci: DupGroup[]): number {
  console.log("\n" + "=".repeat(64));
  console.log(title);
  console.log("=".repeat(64));

  if (exact.length === 0) {
    console.log("✅ Không có email TRÙNG TUYỆT ĐỐI — unique index sẽ build OK.");
  } else {
    console.log(
      `❌ ${exact.length} nhóm TRÙNG TUYỆT ĐỐI — PHẢI xử lý trước khi bật unique index:`,
    );
    for (const g of exact) {
      console.log(`\n  "${g.value}" (${g.docs.length} bản ghi):`);
      for (const d of g.docs) {
        const flag = d.isDeleted ? "🗑️  [đã xóa mềm]" : "🟢 [đang dùng]";
        console.log(`     - ${flag} _id=${d.id}  ${d.label}`);
      }
    }
  }

  if (ci.length > 0) {
    console.log(
      `\n⚠️  ${ci.length} nhóm TRÙNG (không phân biệt hoa/thường) — không chặn index nhưng nên rà soát:`,
    );
    for (const g of ci) {
      console.log(`\n  ~ "${g.value}":`);
      for (const d of g.docs) {
        const flag = d.isDeleted ? "🗑️ " : "🟢 ";
        console.log(`     - ${flag} _id=${d.id}  "${d.label}"`);
      }
    }
  }

  return exact.length;
}

async function run() {
  if (!process.env.DATABASE) {
    console.error("❌ Thiếu biến môi trường DATABASE trong .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.DATABASE as string);
  console.log("[check-dup] Đã kết nối DB");

  const companyExact = await findExactDuplicates(Company, "email", [
    "companyCode",
    "companyName",
  ]);
  const companyCi = await findCaseInsensitiveDuplicates(Company, "email");

  const providerExact = await findExactDuplicates(
    ContainerProvider,
    "contact_email",
    ["code", "name"],
  );
  const providerCi = await findCaseInsensitiveDuplicates(
    ContainerProvider,
    "contact_email",
  );

  const blockingCompany = printReport(
    "COMPANY  →  Company.email",
    companyExact,
    companyCi,
  );
  const blockingProvider = printReport(
    "PROVIDER →  ContainerProvider.contact_email",
    providerExact,
    providerCi,
  );

  const totalBlocking = blockingCompany + blockingProvider;

  console.log("\n" + "=".repeat(64));
  if (totalBlocking === 0) {
    console.log(
      "✅ KẾT LUẬN: Không có trùng tuyệt đối. An toàn để bật unique index.",
    );
  } else {
    console.log(
      `❌ KẾT LUẬN: Có ${totalBlocking} nhóm trùng tuyệt đối. Hãy đổi email hoặc` +
        ` xóa vĩnh viễn (kể cả bản trong thùng rác) TRƯỚC khi build index.`,
    );
  }
  console.log("=".repeat(64) + "\n");

  await mongoose.disconnect();
  // exit code khác 0 để CI/CD có thể chặn deploy nếu còn trùng.
  process.exit(totalBlocking === 0 ? 0 : 1);
}

run().catch(async (err) => {
  console.error("[check-dup] Lỗi:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
