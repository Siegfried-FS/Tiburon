// Lambda function to manage user roles by changing their Cognito Group.
const { 
    CognitoIdentityProviderClient,
    AdminListGroupsForUserCommand,
    AdminRemoveUserFromGroupCommand,
    AdminAddUserToGroupCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const USER_POOL_ID = process.env.USER_POOL_ID; // This needs to be set as an environment variable in the Lambda config

// Standard headers for CORS
const headers = {
    'Access-Control-Allow-Origin': '*', // Or a specific origin
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
};

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }

    try {
        // 1. Security Check: Verify the caller is an admin
        const callerGroups = event.requestContext?.authorizer?.claims?.['cognito:groups'];
        if (!callerGroups || !JSON.parse(callerGroups).includes('Admins')) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ message: "Forbidden: Caller is not an administrator." }),
            };
        }

        // 2. Parse input from the event body
        if (!event.body) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: "Bad Request: Missing event body." }),
            };
        }
        const { username, newRole } = JSON.parse(event.body);

        if (!username || !newRole) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: "Bad Request: 'username' and 'newRole' are required." }),
            };
        }

        // 3. Get the user's current groups
        const listGroupsParams = {
            UserPoolId: USER_POOL_ID,
            Username: username,
        };
        const listGroupsCommand = new AdminListGroupsForUserCommand(listGroupsParams);
        const { Groups } = await cognitoClient.send(listGroupsCommand);

        // 4. Remove user from all current groups
        if (Groups && Groups.length > 0) {
            for (const group of Groups) {
                const removeParams = {
                    UserPoolId: USER_POOL_ID,
                    Username: username,
                    GroupName: group.GroupName,
                };
                const removeCommand = new AdminRemoveUserFromGroupCommand(removeParams);
                await cognitoClient.send(removeCommand);
                console.log(`User ${username} removed from group ${group.GroupName}.`);
            }
        }

        // 5. Add user to the new group
        const addParams = {
            UserPoolId: USER_POOL_ID,
            Username: username,
            GroupName: newRole,
        };
        const addCommand = new AdminAddUserToGroupCommand(addParams);
        await cognitoClient.send(addCommand);
        console.log(`User ${username} added to group ${newRole}.`);
        
        // 6. Return success response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: `Successfully changed user ${username}'s role to ${newRole}.` }),
        };

    } catch (error) {
        console.error('Error managing user role:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
    }
};