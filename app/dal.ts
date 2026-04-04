import "server-only";

import { auth } from "@/app/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { PrismaClient } from "./generated/prisma";

// Instantiate the client so it's available to your functions
const prisma = new PrismaClient();
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
      userId: userId
    },
    include: {
      rawInvoice: {
        select: {
          type: true
        }
      }
    }
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