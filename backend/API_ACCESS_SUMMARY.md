| API Endpoint | Method | Access Level | Authentication Required | Special Role Required |
|-------------|--------|--------------|-------------------------|----------------------|
| / | GET | Public | No | No |
| /api/auth/register | POST | Public | No | No |
| /api/auth/login | POST | Public | No | No |
| /api/properties | GET | Public | No | No |
| /api/properties/:id | GET | Public | No | No |
| /api/auth/me | GET | Protected | Yes (Bearer token) | No |
| /api/auth/profile | PUT | Protected | Yes (Bearer token) | No |
| /api/properties/user/recommendations | GET | Protected | Yes (Bearer token) | No |
| /api/properties | POST | Admin/Owner Only | Yes (Bearer token) | Yes (admin or owner) |
| /api/properties/:id | PUT | Admin/Owner Only | Yes (Bearer token) | Yes (admin or owner) |
| /api/properties/:id | DELETE | Admin/Owner Only | Yes (Bearer token) | Yes (admin or owner) |