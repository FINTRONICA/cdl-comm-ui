import { z } from 'zod';

// Contact validation schema based on the specifications
export const contactValidationSchema = z.object({
  
  bpcFirstName: z.string().max(35, 'First Name must be 35 characters or less').optional(),
  bpcLastName: z.string().max(35, 'Last Name must be 35 characters or less').optional(),
  bpcContactEmail: z.string().email({ message: 'Please enter a valid email address' }).optional(),
  bpcContactAddressLine1: z.string().max(30, 'Address Line 1 must be 30 characters or less').optional(),
  bpcContactAddressLine2: z.string().max(30, 'Address Line 2 must be 30 characters or less').optional(),
  bpcContactPoBox: z.string().max(7, 'PO Box must be 7 characters or less').optional(),
  bpcCountryMobCode: z.string().optional(),
  bpcContactTelNo: z.string().max(15, 'Telephone Number must be 15 characters or less').optional(),
  bpcContactMobNo: z.string().max(15, 'Mobile Number must be 15 characters or less').optional(),
  bpcContactFaxNo: z.string().max(10, 'FAX Number must be 10 characters or less').optional(),
});
