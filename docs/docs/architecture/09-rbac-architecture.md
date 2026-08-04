# 9. RBAC (Role-Based Access Control) Architecture

## 9.1 Overview
Authorization is enforced via Role-Based Access Control, layered on top of JWT authentication.
Every authenticated request carries a `role` claim used by RBAC middleware to authorize access to
specific routes/actions.

## 9.2 Roles (from Sprint Planning)
| Role | Scope |
|---|---|
| Admin | Full system access |
| Test Manager / Lead | Project & suite management, reporting, assignment |
| QA Engineer (Manual) | Test case authoring/execution, defect logging |
| QA Automation Engineer | Playwright run management, automation results |
| Developer | Defect visibility/update, report viewing |
| Viewer / Stakeholder | Read-only dashboard/report access |

## 9.3 Permission Model
Permissions are modeled as `resource:action` pairs, grouped into roles:

```
project:create, project:read, project:update, project:delete
testcase:create, testcase:read, testcase:update, testcase:delete
execution:create, execution:read
automation:trigger, automation:read
defect:create, defect:read, defect:update, defect:assign
report:read
user:manage, role:manage
```

## 9.4 Role-Permission Mapping (Indicative)

| Permission | Admin | Test Manager | QA Engineer | QA Automation | Developer | Viewer |
|---|---|---|---|---|---|---|
| project:create/update/delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| testcase:create/update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| execution:create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| automation:trigger | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| defect:create/update | ✅ | ✅ | ✅ | ✅ | ✅ (status only) | ❌ |
| report:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| user:manage / role:manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## 9.5 Enforcement Points
- **Middleware-level**: `rbacMiddleware(requiredPermission)` wraps route definitions, rejecting with
  `403 Forbidden` if the authenticated user's role lacks the permission.
- **Service-level (defense in depth)**: Critical services re-validate ownership/scope (e.g., a Test
  Manager can only manage projects they are assigned to, not all projects) beyond the coarse role
  check.

## 9.6 Data Model for RBAC
```
roles(id, name, description)
permissions(id, key, description)
role_permissions(role_id, permission_id)
users(id, ..., role_id)
```
This normalized structure allows Admins to evolve role-permission mappings without code changes in
future phases.

## 9.7 Example Middleware Flow
```
Route: DELETE /api/v1/projects/:id
  -> authMiddleware (JWT valid?)
  -> rbacMiddleware('project:delete')
  -> controller.deleteProject
```
