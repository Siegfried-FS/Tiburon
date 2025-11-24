const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
const s3 = new S3Client({ region: 'us-east-1' });

const TABLE_NAME = 'tiburon-posts';
const BUCKET_NAME = 'tiburon-feed-data';
const FEED_KEY = 'feed.json';

const headers = {
    'Access-Control-Allow-Origin': 'https://tiburoncp.siegfried-fs.com',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }
    
    try {
        const method = event.httpMethod;
        const path = event.rawPath || event.path || '';
        
        console.log('Method:', method, 'Path:', path);
        
        switch (method) {
            case 'GET':
                if (path.endsWith('/stats') || path.includes('stats')) {
                    return await getStats();
                }
                return await getPosts(event.queryStringParameters);
                
            case 'POST':
                return await createPost(JSON.parse(event.body));
                
            case 'PUT':
                const postId = path.split('/').pop();
                return await updatePost(postId, JSON.parse(event.body));
                
            case 'DELETE':
                const deleteId = path.split('/').pop();
                return await deletePost(deleteId);
                
            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Method not allowed' })
                };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

async function getPosts(queryParams = {}) {
    const { status, limit = 50 } = queryParams;
    
    let params = {
        TableName: TABLE_NAME,
        Limit: parseInt(limit)
    };
    
    if (status && status !== 'all') {
        params.IndexName = 'status-createdAt-index';
        params.KeyConditionExpression = '#status = :status';
        params.ExpressionAttributeNames = { '#status': 'status' };
        params.ExpressionAttributeValues = { ':status': status };
        params.ScanIndexForward = false;
    } else {
        params = {
            TableName: TABLE_NAME,
            Limit: parseInt(limit)
        };
    }
    
    const result = status && status !== 'all' 
        ? await dynamodb.send(new QueryCommand(params))
        : await dynamodb.send(new ScanCommand(params));
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            posts: result.Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        })
    };
}

async function createPost(postData) {
    const post = {
        id: `post-${Date.now()}`,
        title: postData.title,
        content: postData.content,
        author: postData.author || 'Admin',
        status: postData.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: postData.tags || [],
        category: postData.category || 'general'
    };
    
    await dynamodb.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: post
    }));
    
    // Si el post es publicado, actualizar feed.json
    if (post.status === 'published') {
        await updateFeedJson();
    }
    
    return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ post })
    };
}

async function updatePost(postId, updateData) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    Object.keys(updateData).forEach(key => {
        if (key !== 'id') {
            updateExpression.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = updateData[key];
        }
    });
    
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    updateExpression.push('#updatedAt = :updatedAt');
    
    await dynamodb.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: postId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
    }));
    
    // Si el status cambió a published, actualizar feed.json
    if (updateData.status === 'published') {
        await updateFeedJson();
    }
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Post updated successfully' })
    };
}

async function deletePost(postId) {
    await dynamodb.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: postId }
    }));
    
    await updateFeedJson();
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Post deleted successfully' })
    };
}

async function getStats() {
    const allPosts = await dynamodb.send(new ScanCommand({
        TableName: TABLE_NAME
    }));
    
    const posts = allPosts.Items;
    const totalPosts = posts.filter(p => p.status === 'published').length;
    const pendingPosts = posts.filter(p => p.status === 'pending').length;
    
    // Calcular crecimiento mensual
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentPosts = posts.filter(p => new Date(p.createdAt) > lastMonth);
    const monthlyGrowth = recentPosts.length;
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            totalPosts,
            pendingPosts,
            monthlyGrowth: `+${monthlyGrowth}`,
            totalUsers: 2 // Placeholder - implementar cuando tengamos tabla de usuarios
        })
    };
}

async function updateFeedJson() {
    try {
        // Obtener posts publicados
        const result = await dynamodb.send(new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: 'status-createdAt-index',
            KeyConditionExpression: '#status = :status',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':status': 'published' },
            ScanIndexForward: false
        }));
        
        const feedPosts = result.Items.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            author: post.author,
            date: post.createdAt,
            tags: post.tags || [],
            category: post.category || 'general'
        }));
        
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: FEED_KEY,
            Body: JSON.stringify({ posts: feedPosts }),
            ContentType: 'application/json',
            ACL: 'public-read'
        }));
        
        console.log('Feed updated successfully');
    } catch (error) {
        console.error('Error updating feed:', error);
    }
}
