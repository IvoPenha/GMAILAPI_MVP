import { Profile } from '@prisma/client';

interface Attachment {
  id: number;
  sentBy: string;
  fileName: string;
  emailDate: Date;
  messageId: string;
  subject: string;
  barcode: string;
  dueDate: Date;
  amount: number | null;
  base64: string;
  profileId: number;
  profile: Profile;
}
