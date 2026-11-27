import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwksValidator, type JwtPayload } from "@yuva-devlab/auth-server";
import { HttpHeaderValue } from "@devlab-ai-studio/shared-types";
import type { IncomingMessage } from "node:http";
import { loadApiConfig } from "../../config/api-config";
import { IS_PUBLIC_KEY } from "./public.decorator";

interface AuthenticatedRequest extends IncomingMessage {
  user?: JwtPayload;
}

/**
 * Verifies RS256 DevLab Portal SSO JWTs via JWKS for Control Plane routes.
 */
@Injectable()
export class PortalAuthGuard implements CanActivate {
  private readonly validator: JwksValidator;

  constructor(private readonly reflector: Reflector) {
    const { portalApiUrl } = loadApiConfig();
    this.validator = new JwksValidator({ issuer: portalApiUrl });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith(HttpHeaderValue.BEARER_PREFIX)
      ? authHeader.slice(HttpHeaderValue.BEARER_PREFIX.length).trim()
      : undefined;

    if (!token) {
      throw new UnauthorizedException("Missing DevLab Portal authorization token");
    }

    try {
      request.user = await this.validator.verifyToken(token);
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired DevLab Portal session");
    }
  }
}
