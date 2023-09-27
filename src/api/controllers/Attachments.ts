import { PrismaClient, Attachment } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

interface AttachmentRequest {
    sentBy: string;
    fileName: string;
    emailDate: Date;
    messageId: string;
    subject: string;
    boleto:{
        codigoBarras: string;
        valor?: number | null;
        base64: string;
        vencimento: Date;
    }
    profileId: number;
}

export async function getAttachmentByMessageID(messageId : string){
    try {
        const attachment = await prisma.attachment.findFirst({
            where: {
                messageId
            }
        })
        if(!attachment)
            return null
        return attachment
    } catch (error: any) {
        return error;
    }
}

export async function createAttachment(req: AttachmentRequest) {
    try {
        const { sentBy, fileName, emailDate, messageId, subject, boleto, profileId } = req;
        const { codigoBarras: barcode, vencimento: dueDate, valor: amount, base64 } = boleto
        console.log(
            'sentBy: ', sentBy,
            'fileName: ', fileName,
            'emailDate: ', emailDate,
            'messageId: ', messageId,
            'subject: ', subject,
            'barcode: ', barcode,
            'dueDate: ', dueDate,
            'amount: ', amount,
            'base64: ', base64,
            'profileId: ', profileId
        )
        if(profileId === undefined || isNaN(profileId))
            throw new Error('ID de usuário inválido')

        const profile = await prisma.profile.findUnique({
            where: {
                id: profileId
            }
        })
        if(!profile)
            throw new Error('Usuário não encontrado')
        const hasAlreadyAttachment = await getAttachmentByMessageID(messageId)
        if(hasAlreadyAttachment !== null){
            console.log('ja to cadastrado')
        }
        const threatedEmailDate = new Date(emailDate)
        const threatedDueDate = new Date(dueDate)
        const attachment = await prisma.attachment.create({
            data: {
                sentBy,
                fileName,
                emailDate : threatedEmailDate,
                messageId,
                subject,
                barcode,
                dueDate : threatedDueDate,
                amount,
                base64,
                profileId
            }
        })
        return attachment;
    } catch (error: any) {
        return error;
    }
}

export async function getAttachmentsByProfile(req: {params: {profileId: number}}, res: Response<{message: string, response: {attachments?: Attachment[], error?: string}}>) {
    try {
        const { profileId } = req.params;
        if(!profileId || isNaN(profileId)){
            return res.status(400).json({message: 'ID de usuário inválido', response: {attachments: []}})
        }
        const attachments = await prisma.attachment.findMany({
            where: {
                profileId: +profileId
            }
        })
        return res.status(200).json({message: 'Anexos encontrados', response: {attachments}})
    } catch (error: any) {
        return res.status(500).json({message: 'Ocorreu um erro ao buscar os anexos', response: {error: error.message}})
    }
}