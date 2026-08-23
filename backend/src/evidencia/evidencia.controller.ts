import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, existsSync } from 'fs';
import type { Response } from 'express';
import { EvidenciaService } from './evidencia.service';
import { opcionesMulter } from './evidencia.storage';
import { CrearEnlaceDto } from './dto/crear-enlace.dto';
import { SubirArchivoDto } from './dto/subir-archivo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtPayload } from '../auth/tipos';

// Todo el módulo requiere sesión: el contenido de las Evidencias es privado
// (RN-06, RN-13). Subir requiere estar asignado a la actividad (o ser admin).
@Controller()
@UseGuards(JwtAuthGuard)
export class EvidenciaController {
  constructor(private readonly evidencias: EvidenciaService) {}

  @Post('actividades/:id/evidencias/enlace')
  crearEnlace(
    @Param('id') actividadId: string,
    @Body() dto: CrearEnlaceDto,
    @UsuarioActual() usuario: JwtPayload,
  ) {
    return this.evidencias.crearEnlace(
      actividadId,
      usuario.sub,
      usuario.rol === 'administrador',
      dto,
    );
  }

  @Post('actividades/:id/evidencias/archivo')
  @UseInterceptors(FileInterceptor('archivo', opcionesMulter()))
  subirArchivo(
    @Param('id') actividadId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SubirArchivoDto,
    @UsuarioActual() usuario: JwtPayload,
  ) {
    return this.evidencias.crearArchivo(
      actividadId,
      usuario.sub,
      usuario.rol === 'administrador',
      dto,
      file,
    );
  }

  @Get('actividades/:id/evidencias')
  listar(@Param('id') actividadId: string) {
    return this.evidencias.listar(actividadId);
  }

  // Único punto de acceso al contenido/enlace (autenticado, RN-13).
  @Get('evidencias/:id/contenido')
  async contenido(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const evidencia = await this.evidencias.obtenerCompleta(id);
    if (evidencia.tipo === 'enlace') {
      return { tipo: 'enlace', url: evidencia.url };
    }
    if (!evidencia.archivoRef) throw new NotFoundException('La evidencia no tiene archivo');
    const ruta = this.evidencias.rutaArchivo(evidencia.archivoRef);
    if (!existsSync(ruta)) throw new NotFoundException('Archivo no disponible');

    res.set({
      'Content-Type': evidencia.mime ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${evidencia.nombreArchivo ?? evidencia.archivoRef}"`,
    });
    return new StreamableFile(createReadStream(ruta));
  }

  @Delete('evidencias/:id')
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: JwtPayload) {
    return this.evidencias.eliminar(id, usuario.sub, usuario.rol === 'administrador');
  }
}
