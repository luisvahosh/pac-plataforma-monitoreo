import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

// Envío de correo desacoplado (ADR-0007).
//  - CORREO_MODO=dev  : no envía correos reales; los registra (para pruebas).
//  - CORREO_MODO=smtp : envía por Office 365 / Microsoft 365 (SMTP autenticado).
// Alternativa recomendada a futuro: Microsoft Graph API con OAuth2 (client
// credentials). Requiere del tenant: SMTP AUTH habilitado o app en Entra ID con
// permiso Mail.Send.
@Injectable()
export class CorreoService {
  private readonly logger = new Logger(CorreoService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly modo = process.env.CORREO_MODO ?? 'dev';

  constructor() {
    this.transporter =
      this.modo === 'smtp'
        ? nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: false, // STARTTLS en el puerto 587
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          })
        : nodemailer.createTransport({ jsonTransport: true });
  }

  private async enviar(destino: string, asunto: string, html: string): Promise<void> {
    const remitente = process.env.CORREO_REMITENTE ?? 'no-reply@pac.local';
    await this.transporter.sendMail({ from: remitente, to: destino, subject: asunto, html });
    if (this.modo !== 'smtp') {
      this.logger.log(`[correo:dev] "${asunto}" para ${destino} (no enviado; modo desarrollo).`);
    }
  }

  private appUrl(): string {
    return process.env.APP_URL ?? 'http://localhost';
  }

  async enviarActivacion(destino: string, nombre: string, token: string): Promise<void> {
    const enlace = `${this.appUrl()}/activar?token=${encodeURIComponent(token)}`;
    await this.enviar(
      destino,
      'Activa tu cuenta — Plataforma PAC',
      `<p>Hola ${nombre},</p>
       <p>Se creó una cuenta para ti en la Plataforma de Seguimiento del PAC.</p>
       <p>Actívala y configura tu segundo factor (2FA) aquí:
       <a href="${enlace}">${enlace}</a></p>
       <p>Este enlace caduca pronto por seguridad.</p>`,
    );
  }

  async enviarRecuperacion(destino: string, token: string): Promise<void> {
    const enlace = `${this.appUrl()}/restablecer?token=${encodeURIComponent(token)}`;
    await this.enviar(
      destino,
      'Recuperación de contraseña — Plataforma PAC',
      `<p>Recibimos una solicitud para restablecer tu contraseña.</p>
       <p>Si fuiste tú, continúa aquí: <a href="${enlace}">${enlace}</a></p>
       <p>Si no fuiste tú, ignora este mensaje.</p>`,
    );
  }

  async enviarAlertaProximaVencer(
    destino: string,
    actividad: string,
    dias: number,
  ): Promise<void> {
    await this.enviar(
      destino,
      `Actividad próxima a vencer (${dias} día(s)) — PAC`,
      `<p>La actividad <strong>${actividad}</strong> vence en aproximadamente ${dias} día(s).</p>
       <p>Registra tu avance en la plataforma.</p>`,
    );
  }

  async enviarAlertaVencida(destino: string, actividad: string): Promise<void> {
    await this.enviar(
      destino,
      `Actividad vencida — PAC`,
      `<p>La actividad <strong>${actividad}</strong> ha superado su fecha de fin planificada.</p>
       <p>Actualiza su estado o solicita un cambio de línea base si corresponde.</p>`,
    );
  }

  async enviarConfirmacionAvance(
    destino: string,
    actividad: string,
    porcentaje: number,
  ): Promise<void> {
    await this.enviar(
      destino,
      `Avance registrado — PAC`,
      `<p>Se registró tu avance en la actividad <strong>${actividad}</strong>: ${porcentaje}%.</p>`,
    );
  }
}
