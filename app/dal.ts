import "server-only";

import { auth } from "@/app/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
export const verifySession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.user.id };
});
/** * WRAPPER FUNCTIONS: GETTERS
 */

// Get a single invoice with its binary type info
export const getInvoiceById = cache(async (invoiceId: string) => {
  const { userId } = await verifySession();

  return await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      userId: userId // Security: Only owner can fetch
    },
    include: {
      rawInvoice: {
        select: { type: true }
      }
    }
  });
});

// Get all invoices for the current client, sorted by newest first
export const getMyInvoices = cache(async () => {
  const { userId } = await verifySession();

  return await prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
});

// Accountant Wrapper: Get all "Action Required" invoices from all assigned clients
export const getAccountantTaskQueue = cache(async () => {
  const { userId: accountantId } = await verifySession();

  return await prisma.user.findUnique({
    where: { id: accountantId },
    select: {
      clients: {
        select: {
          id: true,
          name: true,
          invoices: {
            where: {
              status: { in: ["PROCESSING", "READY_FOR_REVIEW"] }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      }
    }
  });
});