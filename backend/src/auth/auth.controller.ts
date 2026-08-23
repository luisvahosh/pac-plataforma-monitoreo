import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Verificar2faDto } from './dto/verificar-2fa.dto';
import { ActivarCuentaDto } from './dto/activar-cuenta.dto';
import { RestablecerPasswordDto, SolicitarRecuperacionDto } from './dto/recuperacion.dto';
import { TokenDto } from './dto/token.dto';

// Endpoints públicos de autenticación (no requieren sesión previa).
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Límite estricto contra fuerza bruta (complementa el bloqueo por intentos).
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.loginPaso1(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('2fa/verify')
  verificar2fa(@Body() dto: Verificar2faDto) {
    return this.auth.loginPaso2(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: TokenDto) {
    return this.auth.refrescar(dto.refreshToken);
  }

  @Post('logout')
  logout(@Body() dto: TokenDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @Post('activate')
  activar(@Body() dto: ActivarCuentaDto) {
    return this.auth.activarCuenta(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('password/forgot')
  solicitarRecuperacion(@Body() dto: SolicitarRecuperacionDto) {
    return this.auth.solicitarRecuperacion(dto);
  }

  @Post('password/reset')
  restablecer(@Body() dto: RestablecerPasswordDto) {
    return this.auth.restablecerPassword(dto);
  }
}
