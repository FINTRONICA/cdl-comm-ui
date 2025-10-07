import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/middleware/auth';
import { APISecurityService, InputValidator } from '@/lib/apiSecurity';
import { AuditLogger } from '@/lib/auditLogger';
import { Permission } from '@/lib/auth';
import { z } from 'zod';

// Transaction schema for validation
const TransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
  type: z.enum(['deposit', 'withdrawal', 'transfer']),
  currency: z.string().length(3).default('USD')
});

export async function GET(request: NextRequest) {
  try {
    // Security check
    const securityCheck = await APISecurityService.performSecurityCheck(request);
    if (!securityCheck.allowed) {
      return NextResponse.json(
        { error: securityCheck.error },
        { status: securityCheck.statusCode || 403 }
      );
    }

    // Authentication check
    const authResult = await AuthMiddleware.authenticateAPI(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Authorization check
    const authCheck = await AuthMiddleware.requirePermissionAPI(
      request,
      Permission.READ_TRANSACTION
    );
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    // Log API access
    AuditLogger.logAPIAccess(
      '/api/transactions',
      'GET',
      authCheck.user.userId,
      authCheck.user.email,
      authCheck.user.role,
      getClientIP(request),
      request.headers.get('user-agent') || '',
      100, // response time placeholder
      200
    );

    // Your actual transaction logic here
    const transactions = [
      {
        id: '1',
        amount: 1000,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ]; // Replace with actual data

    const response = NextResponse.json({ transactions });
    return APISecurityService.addSecurityHeaders(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Security check
    const securityCheck = await APISecurityService.performSecurityCheck(request);
    if (!securityCheck.allowed) {
      return NextResponse.json(
        { error: securityCheck.error },
        { status: securityCheck.statusCode || 403 }
      );
    }

    // Authentication check
    const authResult = await AuthMiddleware.authenticateAPI(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Authorization check
    const authCheck = await AuthMiddleware.requirePermissionAPI(
      request,
      Permission.CREATE_TRANSACTION
    );
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    // Validate request body
    const validation = await InputValidator.validateRequest(request, TransactionSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Log API access
    AuditLogger.logAPIAccess(
      '/api/transactions',
      'POST',
      authCheck.user.userId,
      authCheck.user.email,
      authCheck.user.role,
      getClientIP(request),
      request.headers.get('user-agent') || '',
      150, // response time placeholder
      201
    );

    // Your actual transaction creation logic here
    const newTransaction = {
      id: Date.now().toString(),
      ...validation.data,
      createdAt: new Date().toISOString()
    };

    const response = NextResponse.json({ 
      message: 'Transaction created successfully',
      transaction: newTransaction 
    }, { status: 201 });
    
    return APISecurityService.addSecurityHeaders(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
} 