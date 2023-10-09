import { Usuario, Perfil, Anexo } from "@prisma/client";

export interface Profile {
  id: number;
  googleRefreshToken: string;
  microsoftRefreshToken: string;
  userId: number;
  user: Usuario;
  attachments: Anexo[];
}
