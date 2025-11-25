// Lambda function to list users from a Cognito User Pool, including their roles (groups).
const { 
    CognitoIdentityProviderClient,
    ListUsersCommand,
    AdminListGroupsForUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const USER_POOL_ID = process.env.USER_POOL_ID; // This needs to be set as an environment variable

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'CORS preflight' }) };
    }

    try {
        // Security Check: Verify the caller is an admin
        const callerGroups = event.requestContext?.authorizer?.claims?.['cognito:groups'];
        if (!callerGroups || !JSON.parse(callerGroups).includes('Admins')) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ message: "Forbidden: Caller is not an administrator." }),
            };
        }

        // 1. Get all users
        const listUsersParams = { UserPoolId: USER_POOL_ID };
        const listUsersCommand = new ListUsersCommand(listUsersParams);
        const { Users } = await cognitoClient.send(listUsersCommand);

        // 2. For each user, get their group and format the data
        const formattedUsers = await Promise.all(Users.map(async (user) => {
            const emailAttr = user.Attributes.find(attr => attr.Name === 'email');
            const nameAttr = user.Attributes.find(attr => attr.Name === 'name');
            
            // Get user's group
            let role = 'Explorador'; // Default role
            try {
                const listGroupsParams = {
                    UserPoolId: USER_POOL_ID,
                    Username: user.Username,
                };
                const listGroupsCommand = new AdminListGroupsForUserCommand(listGroupsParams);
                const { Groups } = await cognitoClient.send(listGroupsCommand);
                if (Groups && Groups.length > 0) {
                    // Assuming user is in one primary group for simplicity
                    role = Groups[0].GroupName;
                }
            } catch(e) {
                console.warn(`Could not retrieve group for user ${user.Username}:`, e.message);
            }

            return {
                username: user.Username,
                status: user.UserStatus,
                created: user.UserCreateDate,
                email: emailAttr ? emailAttr.Value : 'N/A',
                name: nameAttr ? nameAttr.Value : 'N/A',
                role: role
            };
        }));

        return {
            statusCode: 200,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedUsers),
        };

    } catch (error) {
        console.error('Error listing users:', error);
        return {
            statusCode: 500,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
    }
};
