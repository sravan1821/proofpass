import { recruiterLeadSchema } from "@/lib/validations/recruiter";

export function validateRecruiterLead(input: unknown) {
  return recruiterLeadSchema.safeParse(input);
}
