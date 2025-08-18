# Complete API List with Access Levels

## PUBLIC APIS (No authentication required)

### 1. Health Check
- **Method:** GET
- **URL:** http://localhost:1903/
- **Access:** PUBLIC
- **Why Public:** No `protect` middleware in app.js
- **Test in Postman:** Just send GET request, no headers needed

### 2. User Registration
- **Method:** POST
- **URL:** http://localhost:1903/api/auth/register
- **Access:** PUBLIC
- **Why Public:** No `protect` middleware in routes/auth.js
- **Test in Postman:** Send POST with JSON body, no headers needed

### 3. User Login
- **Method:** POST
- **URL:** http://localhost:1903/api/auth/login
- **Access:** PUBLIC
- **Why Public:** No `protect` middleware in routes/auth.js
- **Test in Postman:** Send POST with JSON body, no headers needed

### 4. Get All Properties
- **Method:** GET
- **URL:** http://localhost:1903/api/properties
- **Access:** PUBLIC
- **Why Public:** No `protect` middleware in routes/properties.js
- **Test in Postman:** Just send GET request, no headers needed

### 5. Get Single Property
- **Method:** GET
- **URL:** http://localhost:1903/api/properties/:id
- **Access:** PUBLIC
- **Why Public:** No `protect` middleware in routes/properties.js
- **Test in Postman:** Send GET with property ID, no headers needed

## PROTECTED APIS (Authentication required)

### 6. Get User Profile
- **Method:** GET
- **URL:** http://localhost:1903/api/auth/me
- **Access:** PROTECTED
- **Why Protected:** Has `protect` middleware in routes/auth.js
- **Test in Postman:** Need Authorization header with Bearer token

### 7. Update User Profile
- **Method:** PUT
- **URL:** http://localhost:1903/api/auth/profile
- **Access:** PROTECTED
- **Why Protected:** Has `protect` middleware in routes/auth.js
- **Test in Postman:** Need Authorization header with Bearer token

### 8. Get Recommendations
- **Method:** GET
- **URL:** http://localhost:1903/api/properties/user/recommendations
- **Access:** PROTECTED
- **Why Protected:** Has `protect` middleware in routes/properties.js
- **Test in Postman:** Need Authorization header with Bearer token

## ADMIN/OWNER ONLY APIS (Authentication + Role required)

### 9. Create Property
- **Method:** POST
- **URL:** http://localhost:1903/api/properties
- **Access:** ADMIN/OWNER ONLY
- **Why Protected:** Has `protect` AND `authorize('admin', 'owner')` middleware
- **Test in Postman:** Need Authorization header + user must be admin/owner role

### 10. Update Property
- **Method:** PUT
- **URL:** http://localhost:1903/api/properties/:id
- **Access:** ADMIN/OWNER ONLY
- **Why Protected:** Has `protect` AND `authorize('admin', 'owner')` middleware
- **Test in Postman:** Need Authorization header + user must be admin/owner role

### 11. Delete Property
- **Method:** DELETE
- **URL:** http://localhost:1903/api/properties/:id
- **Access:** ADMIN/OWNER ONLY
- **Why Protected:** Has `protect` AND `authorize('admin', 'owner')` middleware
- **Test in Postman:** Need Authorization header + user must be admin/owner role