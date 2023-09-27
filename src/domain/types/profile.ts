import { Attachment } from '@prisma/client';

interface Profile {
  id: number;
  googleRefreshToken: string;
  microsoftRefreshToken: string;
  userId: number;
  user: User;
  attachments: Attachment[];
}