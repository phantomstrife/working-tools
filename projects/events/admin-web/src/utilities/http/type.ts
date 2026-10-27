import type { NextResponse } from 'next/server';

export type Read_Bearer_Token = (request: Request) => string;
export type Cors_Preflight = () => NextResponse;
export type Cors_Json = (body: AdminWeb.Object, status?: number) => NextResponse;
export type Resolve_Error_Status = (message: string) => number;

