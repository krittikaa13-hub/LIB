export interface StudentSession {
  registrationNumber: string;
  gmail: string;
  sessionToken: string;
  authenticatedAt: string;
  role: string;
  institution: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  registrationNumber: string;
  gmail: string;
  expiresAt: number;
  cooldownSeconds: number;
  isRealSmtp: boolean;
  serviceName: string;
  previewUrl?: string;
  directCode?: string;
  error?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  student?: StudentSession;
  attemptsRemaining?: number;
  error?: string;
}

export interface SmtpConfigStatus {
  smtpConfigured: boolean;
  service: string;
  sender: string;
}
