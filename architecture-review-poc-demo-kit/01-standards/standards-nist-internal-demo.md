# Enterprise Architecture & Security Standards
## (Internal – Government Use)

### 1. Identity & Access Management

**AC-2 – Account Management**  
All systems SHALL enforce role-based access control (RBAC).  
User access MUST be granted based on the principle of least privilege.

Severity: HIGH

---

**IA-5 – Authenticator Management**  
Secrets, API keys, passwords, and credentials SHALL NOT be hardcoded in application code.  
Approved secrets management services MUST be used.

Severity: CRITICAL

---

### 2. Network Security

**SC-7 – Boundary Protection**  
Systems processing Confidential or higher data classifications MUST be deployed in private networks.  
Internet access SHALL be restricted via managed ingress points.

Severity: HIGH

---

### 3. Data Protection

**SC-12 – Cryptographic Key Establishment**  
All data at rest MUST be encrypted using FIPS 140-2 approved algorithms.  
Cloud-native key management services SHALL be used.

Severity: HIGH

---

### 4. AI / ML Systems (Supplemental)

**AI-1 – Secure AI Access**  
AI models processing Confidential data MUST NOT be publicly accessible.  
Private endpoints or VPC-integrated services SHALL be used.

Severity: CRITICAL
