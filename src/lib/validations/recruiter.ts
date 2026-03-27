import { z } from "zod";

export const recruiterLeadSchema = z.object({
  recruiterName: z.string().min(2).max(80),
  company: z.string().min(2).max(80),
  email: z.email(),
  message: z.string().min(10).max(400),
  certificateId: z.string().min(1),
  projectId: z.string().min(1),
});

export const certificateIssueSchema = z.object({
  eventId: z.string().min(1),
  teamId: z.string().min(1),
  projectId: z.string().min(1),
});

export const revokeCertificateSchema = z.object({
  certificateId: z.string().min(1),
  reason: z.string().min(8).max(240),
});
