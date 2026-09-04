import json
from pathlib import Path

base = Path("data")

mapping = {
    "gyms": ("public.gyms", [
        "id", "name", "ownerId", "phone", "email", "address",
        "currency", "status", "subscriptionPlan", "subscriptionStartDate",
        "subscriptionEndDate", "paymentStatus", "subscriptionAmount",
        "createdAt", "updatedAt"
    ]),
    "users": ("public.users", [
        "id", "gymId", "name", "email", "passwordHash", "role",
        "active", "createdAt", "updatedAt"
    ]),
    "members": ("public.members", [
        "id", "gymId", "name", "gender", "phone", "email", "address",
        "permanentAddress", "emergencyContact", "weight", "height",
        "medicalInfo", "membershipPlanId", "joiningDate", "membershipStartDate",
        "membershipEndDate", "referralCode", "isDeleted", "deletedAt",
        "createdAt", "updatedAt"
    ]),
    "membership-plans": ("public.\"membershipPlans\"", [
        "id", "gymId", "name", "durationMonths", "price", "active",
        "createdAt", "updatedAt"
    ]),
    "payments": ("public.payments", [
        "id", "gymId", "memberId", "planId", "amount",
        "paymentDate", "paymentType", "notes", "createdAt"
    ]),
    "notifications": ("public.notifications", [
        "id", "gymId", "memberId", "type", "message", "scheduledAt",
        "read", "createdAt"
    ])
}

def sql_str(value):
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return str(value)
    s = str(value).replace("'", "''")
    return "'" + s + "'"

def quote_col(name):
    return '"' + name + '"'

out = []

for file_name, (table, cols) in mapping.items():
    path = base / f"{file_name}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    qcols = ", ".join(quote_col(c) for c in cols)
    rows = []
    for row in data:
        vals = ", ".join(sql_str(row.get(c)) for c in cols)
        rows.append(f"({vals})")
    out.append(f"INSERT INTO {table} ({qcols}) VALUES")
    out.append(",\n".join(rows) + ";")
    out.append("")

Path("supabase_seed.sql").write_text("\n\n".join(out), encoding="utf-8")
print("Generated supabase_seed.sql")