import { IIIFAuthType } from './iiif-constants';

export interface IIIFAuthService {
  id: string;
  type: string;
  profile?: string;
  label?: string;
  description?: string;
  header?: string;
  confirmLabel?: string;
  failureHeader?: string;
  failureDescription?: string;
  service?: IIIFAuthService[];
}

export interface ProbeServiceResponse {
  "@context": string;
  id: string;
  type: IIIFAuthType;
  status: number;
  substitute?: {
    id: string;
    type: string;
  };
  location?: {
    id: string;
    type: string;
  };
  heading?: {
    en: string[];
  };
  note?: {
    en: string[];
  };
  service?: IIIFAuthService[];
}

export interface TokenServiceResponse {
  "@context": string;
  type: IIIFAuthType;
  accessToken: string;
  expiresIn: number;
  messageId: string;
}

export interface AccessServiceResponse {
  "@context": string;
  type: IIIFAuthType;
  profile: string;
  heading?: {
    en: string[];
  };
  note?: {
    en: string[];
  };
  error?: string;
}