import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

// Envío de correo desacoplado (ADR-0007).
//  - CORREO_MODO=dev   : no envía correos reales; los registra (para pruebas).
//  - CORREO_MODO=graph : Microsoft Graph API con OAuth2 (client credentials).
//                        Recomendado: no depende de SMTP AUTH ni de que el
//                        tenant tenga deshabilitados los "Security Defaults"
//                        (que bloquean toda autenticación básica, incluido
//                        SMTP, a nivel de todo el tenant). Requiere una app
//                        registrada en Entra ID con permiso de aplicación
//                        Mail.Send y consentimiento de administrador.
//  - CORREO_MODO=smtp  : SMTP autenticado (alternativa). Falla con
//                        "535 5.7.139 ... security defaults policy" si el
//                        tenant tiene Security Defaults u otra política que
//                        bloquea autenticación heredada — en ese caso usar
//                        CORREO_MODO=graph en su lugar.
@Injectable()
export class CorreoService {
  private readonly logger = new Logger(CorreoService.name);
  private readonly modo = process.env.CORREO_MODO ?? 'dev';
  private readonly transporterSmtp: nodemailer.Transporter | null =
    this.modo === 'smtp'
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: false, // STARTTLS en el puerto 587
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        })
      : null;

  private tokenGraphCache: { token: string; expiraEn: number } | null = null;

  // ─── Microsoft Graph (OAuth2 client credentials) ───────────────
  private async obtenerTokenGraph(): Promise<string> {
    // Reutiliza el token mientras falten más de 30s para que expire.
    if (this.tokenGraphCache && this.tokenGraphCache.expiraEn > Date.now() + 30_000) {
      return this.tokenGraphCache.token;
    }
    const tenantId = process.env.MS_GRAPH_TENANT_ID;
    const clientId = process.env.MS_GRAPH_CLIENT_ID;
    const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId ?? '',
      client_secret: clientSecret ?? '',
      scope: 'https://graph.microsoft.com/.default',
    });

    const r = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    if (!r.ok) {
      throw new Error(`No se pudo obtener el token de Microsoft Graph: HTTP ${r.status} ${await r.text()}`);
    }
    const datos = (await r.json()) as { access_token: string; expires_in: number };
    this.tokenGraphCache = { token: datos.access_token, expiraEn: Date.now() + datos.expires_in * 1000 };
    return datos.access_token;
  }

  private async enviarPorGraph(destino: string, asunto: string, html: string): Promise<void> {
    const remitente = process.env.MS_GRAPH_SENDER ?? process.env.CORREO_REMITENTE ?? '';
    const token = await this.obtenerTokenGraph();

    const r = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(remitente)}/sendMail`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            subject: asunto,
            body: { contentType: 'HTML', content: html },
            toRecipients: [{ emailAddress: { address: destino } }],
          },
          saveToSentItems: false,
        }),
      },
    );
    if (!r.ok) {
      throw new Error(`Microsoft Graph rechazó el envío: HTTP ${r.status} ${await r.text()}`);
    }
  }

  // ─── Envío ───────────────────────────────────────────────────
  private async enviar(destino: string, asunto: string, html: string): Promise<void> {
    if (this.modo === 'graph') {
      await this.enviarPorGraph(destino, asunto, html);
      return;
    }
    if (this.modo === 'smtp' && this.transporterSmtp) {
      const remitente = process.env.CORREO_REMITENTE ?? 'no-reply@pac.local';
      await this.transporterSmtp.sendMail({ from: remitente, to: destino, subject: asunto, html });
      return;
    }
    this.logger.log(`[correo:dev] "${asunto}" para ${destino} (no enviado; modo desarrollo).`);
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
