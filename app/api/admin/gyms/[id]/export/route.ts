import { requireRole } from '@/lib/auth/session';
import { gymRepo, memberRepo, planRepo, paymentRepo } from '@/lib/repositories';
import { errorResponse } from '@/lib/utils/api';
import * as XLSX from 'xlsx';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('SUPER_ADMIN');

    const { id } = await params;
    const gym = await gymRepo.findById(id);
    if (!gym) {
      return errorResponse('GYM_NOT_FOUND', 'Gym not found');
    }

    const [members, plans, payments] = await Promise.all([
      memberRepo.findByGymId(id),
      planRepo.findByGymId(id),
      paymentRepo.findByGymId(id),
    ]);

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Gym Details
    const gymDetails = [
      ['Field', 'Value'],
      ['Gym Name', gym.name],
      ['Email', gym.email],
      ['Phone', gym.phone],
      ['Address', gym.address],
      ['Currency', gym.currency],
      ['Status', gym.status],
      ['Subscription Plan', gym.subscriptionPlan],
      ['Subscription Start Date', gym.subscriptionStartDate],
      ['Subscription End Date', gym.subscriptionEndDate],
      ['Subscription Amount', gym.subscriptionAmount],
      ['Payment Status', gym.paymentStatus],
    ];
    const gymSheet = XLSX.utils.aoa_to_sheet(gymDetails);
    XLSX.utils.book_append_sheet(workbook, gymSheet, 'Gym Details');

    // Sheet 2: Members
    if (members.length > 0) {
      const memberRows = members.map((m) => [
        m.name,
        m.phone,
        m.email || 'N/A',
        plans.find((p) => p.id === m.membershipPlanId)?.name || 'N/A',
        m.membershipStartDate,
        m.membershipEndDate,
        m.isDeleted ? 'Deleted' : 'Active',
        m.createdAt,
      ]);
      const membersSheet = XLSX.utils.aoa_to_sheet([
        ['Name', 'Phone', 'Email', 'Membership Plan', 'Start Date', 'End Date', 'Status', 'Joining Date'],
        ...memberRows,
      ]);
      XLSX.utils.book_append_sheet(workbook, membersSheet, 'Members');
    }

    // Sheet 3: Membership Plans
    if (plans.length > 0) {
      const planRows = plans.map((p) => [
        p.name,
        p.durationMonths,
        p.price,
        p.active ? 'Active' : 'Inactive',
        p.createdAt,
      ]);
      const plansSheet = XLSX.utils.aoa_to_sheet([
        ['Plan Name', 'Duration (Months)', 'Price (₹)', 'Status', 'Created Date'],
        ...planRows,
      ]);
      XLSX.utils.book_append_sheet(workbook, plansSheet, 'Membership Plans');
    }

    // Sheet 4: Payments
    if (payments.length > 0) {
      const paymentRows = payments.map((p) => [
        members.find((m) => m.id === p.memberId)?.name || 'N/A',
        plans.find((pl) => pl.id === p.planId)?.name || 'N/A',
        p.amount,
        p.paymentType,
        p.paymentDate,
        p.notes || 'N/A',
      ]);
      const paymentsSheet = XLSX.utils.aoa_to_sheet([
        ['Member Name', 'Plan Name', 'Amount (₹)', 'Payment Type', 'Payment Date', 'Notes'],
        ...paymentRows,
      ]);
      XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payments');
    }

    // Generate buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Return as file download
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Gym_${gym.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return errorResponse('EXPORT_FAILED', 'Failed to export gym data', 500);
  }
}
