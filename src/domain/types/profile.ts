import { Attachment, User } from "@prisma/client";

export interface Profile {
  id: number;
  googleRefreshToken: string;
  microsoftRefreshToken: string;
  userId: number;
  user: User;
  attachments: Attachment[];
}
