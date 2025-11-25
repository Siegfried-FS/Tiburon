// Test suite for the admin-manage-users-lambda function.
const { handler } = require('./admin-manage-users-lambda');
const { CognitoIdentityProviderClient, AdminListGroupsForUserCommand, AdminRemoveUserFromGroupCommand, AdminAddUserToGroupCommand } = require("@aws-sdk/client-cognito-identity-provider");

// Mock the AWS SDK client
jest.mock("@aws-sdk/client-cognito-identity-provider");

describe('Admin User Management Lambda', () => {
    let mockSend;

    beforeEach(() => {
        // Reset mocks before each test
        mockSend = jest.fn();
        CognitoIdentityProviderClient.prototype.send = mockSend;
    });

    // Test case for a successful role change
    it('should successfully change a user role when called by an admin', async () => {
        // Mock the sequence of Cognito calls
        mockSend
            // 1. Mock AdminListGroupsForUserCommand
            .mockResolvedValueOnce({
                Groups: [{ GroupName: 'Explorador' }]
            })
            // 2. Mock AdminRemoveUserFromGroupCommand
            .mockResolvedValueOnce({})
            // 3. Mock AdminAddUserToGroupCommand
            .mockResolvedValueOnce({});

        const event = {
            httpMethod: 'POST',
            requestContext: {
                authorizer: {
                    claims: {
                        'cognito:groups': '["Admins"]'
                    }
                }
            },
            body: JSON.stringify({
                username: 'testuser',
                newRole: 'Capitan'
            })
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).message).toBe("Successfully changed user testuser's role to Capitan.");
        
        // Verify that send was called 3 times (List, Remove, Add)
        expect(mockSend).toHaveBeenCalledTimes(3);
        expect(mockSend.mock.calls[0][0]).toBeInstanceOf(AdminListGroupsForUserCommand);
        expect(mockSend.mock.calls[1][0]).toBeInstanceOf(AdminRemoveUserFromGroupCommand);
        expect(mockSend.mock.calls[2][0]).toBeInstanceOf(AdminAddUserToGroupCommand);
    });

    // Test case for an unauthorized caller
    it('should return 403 Forbidden if the caller is not in the Admins group', async () => {
        const event = {
            httpMethod: 'POST',
            requestContext: {
                authorizer: {
                    claims: {
                        'cognito:groups': '["Explorador"]' // Not an admin
                    }
                }
            },
            body: JSON.stringify({
                username: 'testuser',
                newRole: 'Capitan'
            })
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.body).message).toBe("Forbidden: Caller is not an administrator.");
        // Ensure no Cognito calls were made
        expect(mockSend).not.toHaveBeenCalled();
    });

    // Test case for missing input
    it('should return 400 Bad Request if username or newRole is missing', async () => {
        const event = {
            httpMethod: 'POST',
            requestContext: {
                authorizer: {
                    claims: {
                        'cognito:groups': '["Admins"]'
                    }
                }
            },
            body: JSON.stringify({
                username: 'testuser' // newRole is missing
            })
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toBe("Bad Request: 'username' and 'newRole' are required.");
        expect(mockSend).not.toHaveBeenCalled();
    });
    
    // Test case for CORS preflight
    it('should handle CORS preflight OPTIONS request', async () => {
        const event = {
            httpMethod: 'OPTIONS'
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        expect(response.headers['Access-Control-Allow-Methods']).toContain('POST');
        expect(JSON.parse(response.body).message).toBe('CORS preflight');
    });

});