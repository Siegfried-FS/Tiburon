# Instructions for Amazon Q or other AI Agent

## Project: Tiburon - AWS User Group Playa Vicente
## Current Branch: `feature/admin-module-testing`

### 1. Current State & Objective
The goal of this branch is to implement a new feature in the Admin Panel: the ability for an administrator to view a list of all users and change their roles (Cognito Groups).

**Work Completed:**
- **New User Role:** A "Moderador" Cognito Group and role description in `niveles.html` have been created.
- **Backend Lambda Code:** Two new Lambda functions have been coded and tested with Jest:
    - `admin-get-users-lambda.js`: Lists all users from Cognito and their assigned group/role.
    - `admin-manage-users-lambda.js`: Changes a user's group/role.
- **Deployment Scripts:** Idempotent deployment scripts for all three backend Lambdas have been created and placed in the `scripts/` directory.
- **Frontend Logic:** The necessary JavaScript code to update `public/assets/js/admin.js` has been developed (but not yet applied).

### 2. CRITICAL BLOCKER
The current execution environment has a **persistent network or configuration issue** that prevents the successful deployment of Lambda functions using the AWS CLI (`aws lambda create-function` or `update-function-code`). Both commands fail with a "Connection closed" error.

**Because of this, the user MUST manually deploy the Lambda functions via the AWS Console.**

### 3. Next Steps for AI Agent

Your task is to complete the integration *after* the user has manually deployed the Lambda functions.

**Step 1: Verify Manual Deployment**
The user has been given instructions to manually create and/or update the following two Lambda functions in the AWS Console:
- `admin-get-users-lambda`
- `admin-manage-users-lambda`

Before proceeding, you must verify they exist. Run the following commands:
```bash
aws lambda get-function --function-name admin-get-users-lambda --profile admin
aws lambda get-function --function-name admin-manage-users-lambda --profile admin
```
If either command returns a `ResourceNotFoundException`, you must stop and instruct the user again to create the function manually.

**Step 2: Configure API Gateway**
Once both Lambdas exist, configure the API Gateway (`fklo6233x5`). Some of these commands may have been run before, but running them again is safe. You will need to capture the **Authorizer ID** and **Integration IDs** from the output of the creation commands to use in subsequent commands.

```bash
# 1. Create Authorizer (if it doesn't exist) - Capture the AuthorizerId from the output.
aws apigatewayv2 create-authorizer --api-id fklo6233x5 --authorizer-type JWT --identity-source "\$request.header.Authorization" --name "Cognito-Authorizer" --jwt-configuration "Audience=1gsjecdf86pgdgvvis7l30hha1,Issuer=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Cg5yUjR6L" --profile admin

# 2. Create Integration for GET /users - Capture the IntegrationId from the output.
aws apigatewayv2 create-integration --api-id fklo6233x5 --integration-type AWS_PROXY --integration-uri "arn:aws:lambda:us-east-1:864981725738:function:admin-get-users-lambda" --payload-format-version "2.0" --profile admin

# 3. Create Route for GET /users (Use IDs from above)
aws apigatewayv2 create-route --api-id fklo6233x5 --route-key "GET /users" --target "integrations/<ID_DE_INTEGRACION_GET>" --authorization-type JWT --authorizer-id <ID_DE_AUTORIZADOR> --profile admin

# 4. Create Integration for POST /users/update-role - Capture the IntegrationId from the output.
aws apigatewayv2 create-integration --api-id fklo6233x5 --integration-type AWS_PROXY --integration-uri "arn:aws:lambda:us-east-1:864981725738:function:admin-manage-users-lambda" --payload-format-version "2.0" --profile admin

# 5. Create Route for POST /users/update-role (Use IDs from above)
aws apigatewayv2 create-route --api-id fklo6233x5 --route-key "POST /users/update-role" --target "integrations/<ID_DE_INTEGRACION_POST>" --authorization-type JWT --authorizer-id <ID_DE_AUTORIZADOR> --profile admin
```

**Step 3: Grant Lambda Permissions**
Execute these two commands to allow the API Gateway to invoke the Lambdas.

```bash
aws lambda add-permission --function-name admin-get-users-lambda --statement-id "apigateway-get-users-invoke-$(date +%s)" --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:us-east-1:864981725738:fklo6233x5/prod/GET/users" --profile admin

aws lambda add-permission --function-name admin-manage-users-lambda --statement-id "apigateway-update-role-invoke-$(date +%s)" --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:us-east-1:864981725738:fklo6233x5/prod/POST/users/update-role" --profile admin
```

**Step 4: Update Frontend Code**
Use the `replace` tool to update `public/assets/js/admin.js` with the new logic that calls the real backend endpoints. This involves replacing the mock user data and the local-only `editUser` function.

**Step 5: Test End-to-End**
After deployment, run a series of `curl` commands or perform manual tests in the browser to:
1.  Verify the user list loads correctly in the admin panel.
2.  Change a test user's role from the UI.
3.  Verify that the change is persisted by reloading the user list.

**Step 6: Final Commit**
Commit all new and modified files to the `feature/admin-module-testing` branch.
```
